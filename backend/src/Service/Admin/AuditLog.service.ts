import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { EventNameEnum, LogActionEnum } from "@Helper/Enum/AuditLogEnum";
import { AuditLogLazyLoadModel, AuditLogModel } from "@Model/Admin/AuditLog.model";
import { DataSource } from "typeorm";
import * as jsonDiff from 'json-diff';
import { AuditLogChangeTableReferenceName, AuditLogIdentityName, AuditLogRemoveColumnsName, AuditLogRemoveColumnsNameByTable, AuditLogSameTableReferenceName } from "@Helper/AuditLog.decorators";
import { InfluxDB, Point } from "@influxdata/influxdb-client";

@Injectable()
export class AuditLogService {
  private RemoveColumnsName = AuditLogRemoveColumnsName;
  private RemoveColumnsNameByTable = AuditLogRemoveColumnsNameByTable;
  private SameReferenceColumn = AuditLogSameTableReferenceName;
  private LogTableIdentifierName = AuditLogIdentityName;
  private ChangeTableReferenceName = AuditLogChangeTableReferenceName;
  private DB = new InfluxDB({ url: this._ConfigService.get("InfluxDB.INFLUX_URL"), token: this._ConfigService.get("InfluxDB.INFLUX_TOKEN") });
  private writeApi = this.DB.getWriteApi(this._ConfigService.get("InfluxDB.INFLUX_ORG"), this._ConfigService.get("InfluxDB.INFLUX_BUCKET"), 's');
  private queryApi = this.DB.getQueryApi(this._ConfigService.get("InfluxDB.INFLUX_ORG"));
  constructor(
    private _ConfigService: ConfigService,
    private _EventEmitter: EventEmitter2,
    private _DataSource: DataSource
  ) {

  }

  AuditEmitEvent(AuditLogData: AuditLogModel) {
    if (this._ConfigService.get("AuditLog.Enable")) {
      this._EventEmitter.emit(EventNameEnum.AuditLog, AuditLogData);
    }
  }

  private GenerateQuery = async (table: string, action_type: LogActionEnum, ids: string[]) => {
    let TableColumns = await this._DataSource.manager.query(`
        SELECT
            COLUMN_NAME AS columns
        FROM
            INFORMATION_SCHEMA.COLUMNS
        WHERE
            TABLE_SCHEMA='${this._ConfigService.get("Database.Name")}'
        AND
            TABLE_NAME='${table}';
    `);
    let InnerJoinColumns = TableColumns.filter(o => !this.RemoveColumnsName.includes(o.columns) && o.columns.includes('_id') && !o.columns.includes('_ids'));
    InnerJoinColumns = InnerJoinColumns.filter(o => !this.RemoveColumnsNameByTable[table]?.includes(o.columns));
    const InnerJoinSelect = InnerJoinColumns.map(o => ({ data: `'${o.columns.replace('_id', "',")} ${table}_${o.columns.replace('_id', '.')}` + this.GetColumneName(table, o.columns) }));
    const InnerJoinQuery = InnerJoinColumns.map(o => ({
      ...o, InnerJoin: `
    LEFT OUTER JOIN
        ${this.GetTableName(table, o.columns)} AS ${table}_${o.columns.replace('_id', '')}
    ON
        ${table}_${o.columns.replace('_id', '')}.id = main.${o.columns}
    `}));
    if (this.SameReferenceColumn[table]) {
      this.SameReferenceColumn[table][1].forEach(o => {
        InnerJoinQuery.push(
          {
            Columns: o, InnerJoin: `LEFT OUTER JOIN
                        ${this.SameReferenceColumn[table][0].table} as ${table}_${o.replace('_id', '')}
                    ON
                        ${table}_${o.replace('_id', '')}.id = main.${o}`
          }
        );
        InnerJoinColumns.push({ Columns: o });
        InnerJoinSelect.push({ data: `'${o.replace('_id', '')}',${table}_${o.replace('_id', '.')}` + this.LogTableIdentifierName[this.SameReferenceColumn[table][0].table].replace("main.", "") })
      });
    }
    const JsonObjectFilter = TableColumns.filter(o => !this.RemoveColumnsName.includes(o.columns) && !o.columns.includes('_id') && !this.RemoveColumnsNameByTable[table]?.includes(o.columns));
    let json_object = JsonObjectFilter.map(o => ({ data: "'" + o.columns + "'," + "main." + o.columns }));
    json_object = json_object.concat(InnerJoinSelect);
    const DynamicQuery = `
        select
            main.id AS performed_module_id,
            '${table}' AS performed_type,
            '${action_type}' AS performed_action,
            ${this.LogTableIdentifierName[table]} AS performed_module_name,
            (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = '${this.LogTableIdentifierName[table].includes(".") ? this.LogTableIdentifierName[table].split(".")[1] : this.LogTableIdentifierName[table]}' AND TABLE_NAME ='${table}' AND TABLE_SCHEMA = '${this._ConfigService.get("Database.Name")}') AS performed_module_header_name,
            json_object(
                ${json_object.map(o => o.data).join(',')}
            ) AS performed_parameter,
            IF(main.updated_on IS NULL, main.created_by_id, main.updated_by_id) AS performed_by_id,
            IFNULL(main.updated_on,main.created_on) AS performed_on,
            IF(CONCAT(usr.first_name,IFNULL(usr.last_name,'')) IS NULL, usr.email, CONCAT(usr.first_name,' ', IFNULL(usr.last_name,''))) AS performed_by,
            '1' AS performed_ipaddress
        FROM
            ${table} AS main
        ${InnerJoinQuery.map(o => o.InnerJoin).join('\n')}
        LEFT OUTER JOIN
            user AS usr
        ON
            usr.id = IF(main.updated_on IS NULL, main.created_by_id, main.updated_by_id)
        WHERE
            main.id IN (${ids.join(',')})
    `;
    return DynamicQuery;
  }

  private async GetLastAddedLog(PerformedType: string, PrimaryId: string): Promise<any> {
    try {
      const GetLastEventLog = new Promise((resolve, reject) => {
        const result: any = [];
        const observerdata = {
          next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            result.push({
              performed_action: o.performed_action,
              performed_by: o.performed_by,
              performed_by_id: o.performed_by_id,
              performed_module_name: o.performed_module_name,
              performed_module_header_name: o.performed_module_header_name,
              performed_module_id: o.performed_module_id,
              performed_on: o.performed_on,
              performed_type: o.performed_type,
              performed_ipaddress: o.performed_ipaddress,
              performed_parameter: JSON.parse(o._value)
            });
          },
          error(error) {
            reject(error);
          },
          complete() {
            resolve(result[0]);
          }
        }
        const startdate: Date = new Date();
        startdate.setFullYear(startdate.getFullYear() - 100);
        const query = `
        from(bucket: "${this._ConfigService.get("InfluxDB.INFLUX_BUCKET")}")
        |> range(start: ${startdate.toISOString()}, stop: ${new Date().toISOString()})
        |> filter(fn: (r) => r["_measurement"] == "${this._ConfigService.get("InfluxDB.INFLUX_DB")}")
        |> filter(fn: (r) => r["performed_type"] == "${PerformedType}")
        |> filter(fn: (r) => r["performed_module_id"] == "${PrimaryId}")
        |> group()
        |> sort(columns: ["performed_on"], desc : true)
        |> limit(n: 1)
    `;
        this.queryApi.queryRows(query, observerdata);
      });
      return await GetLastEventLog;
    }
    catch (e) {
      throw new Error(e);
    }
  }

  @OnEvent(EventNameEnum.AuditLog, { async: true })
  private async Insert(AuditLogData: AuditLogModel) {
    try {
      if (AuditLogData.ActionType == LogActionEnum.Delete) {
        for (const DeletedRecordId of AuditLogData.PrimaryId) {
          const LastUpdatedOrInserted = await this.GetLastAddedLog(AuditLogData.PerformedType, DeletedRecordId);
          if (LastUpdatedOrInserted) {
            for (const iterator of Object.keys(LastUpdatedOrInserted['performed_parameter'])) {
              if (typeof LastUpdatedOrInserted['performed_parameter'][iterator] == 'object') {
                LastUpdatedOrInserted['performed_parameter'][iterator] = LastUpdatedOrInserted['performed_parameter'][iterator]?.__new;
              }
            }
            const dataPoint = new Point(this._ConfigService.get("InfluxDB.INFLUX_DB"))
              .tag('performed_by', LastUpdatedOrInserted.performed_by)
              .tag('performed_by_id', LastUpdatedOrInserted.performed_by_id)
              .tag('performed_on', new Date().toISOString())
              .tag('performed_module_name', LastUpdatedOrInserted.performed_module_name)
              .tag('performed_module_header_name', LastUpdatedOrInserted.performed_module_header_name)
              .tag('performed_module_id', LastUpdatedOrInserted.performed_module_id)
              .tag('performed_type', LastUpdatedOrInserted.performed_type)
              .tag('performed_action', LogActionEnum.Delete)
              .tag('performed_ipaddress', "1")
              .stringField('performed_parameter', JSON.stringify(LastUpdatedOrInserted.performed_parameter));
            this.writeApi.writePoint(dataPoint);
            await this.writeApi.flush();
          }
          else {
            break;
          }
        }
      }
      else {
        const ResultData = await this._DataSource.manager.query(`${await this.GenerateQuery(AuditLogData.PerformedType, AuditLogData.ActionType, AuditLogData.PrimaryId)}`);
        for (const Result of ResultData) {
          if (AuditLogData.ActionType == LogActionEnum.Update) {
            const LastUpdatedOrInserted = await this.GetLastAddedLog(Result.performed_type, Result.performed_module_id);
            if (LastUpdatedOrInserted) {
              for (const iterator of Object.keys(LastUpdatedOrInserted['performed_parameter'])) {
                if (typeof LastUpdatedOrInserted['performed_parameter'][iterator] == 'object') {
                  LastUpdatedOrInserted['performed_parameter'][iterator] = LastUpdatedOrInserted['performed_parameter'][iterator]?.__new;
                }
              }
              const diffrecord = jsonDiff.diff(LastUpdatedOrInserted.performed_parameter, JSON.parse(Result.performed_parameter), { full: true });
              if (diffrecord) {
                for (const iterator of Object.keys(diffrecord)) {
                  if (typeof diffrecord[iterator] == 'object') {
                    if (diffrecord[iterator] == null) {
                      diffrecord[iterator] = "";
                    }
                    else if (diffrecord[iterator]["__old"] == undefined || diffrecord[iterator]["__old"] == null) {
                      diffrecord[iterator]["__old"] = "";
                    }
                  }
                }
                Result.performed_parameter = JSON.stringify(diffrecord);
              }
              else {
                break;
              }
            }
          }
          const dataPoint = new Point(this._ConfigService.get("InfluxDB.INFLUX_DB"))
            .tag('performed_by', Result.performed_by)
            .tag('performed_by_id', Result.performed_by_id)
            .tag('performed_on', new Date(Result.performed_on).toISOString())
            .tag('performed_module_name', Result.performed_module_name)
            .tag('performed_module_header_name', Result.performed_module_header_name)
            .tag('performed_module_id', Result.performed_module_id)
            .tag('performed_type', Result.performed_type)
            .tag('performed_action', Result.performed_action)
            .tag('performed_ipaddress', Result.performed_ipaddress)
            .stringField('performed_parameter', Result.performed_parameter);
          this.writeApi.writePoint(dataPoint);
          await this.writeApi.flush();
        }
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  async LazyLoadList(AuditLogLazyLoadData: AuditLogLazyLoadModel) {
    let WhereCondition: string[] = [];
    let searchKey = AuditLogLazyLoadData.keyword?.length || 0 > 0 ? AuditLogLazyLoadData.keyword : "";
    WhereCondition["performed_on"] = { $gte: AuditLogLazyLoadData.start_date, $lt: AuditLogLazyLoadData.end_date }
    if (AuditLogLazyLoadData.user_id > "0") {
      WhereCondition.push(`|> filter(fn: (r) => r["performed_by_id"] == "${AuditLogLazyLoadData.user_id}")`);
    }
    if (AuditLogLazyLoadData.action?.length > 0) {
      WhereCondition.push(`|> filter(fn: (r) => r["performed_action"] == "${AuditLogLazyLoadData.action}")`);
    }
    if (AuditLogLazyLoadData.module?.length > 0) {
      WhereCondition.push(`|> filter(fn: (r) => r["performed_type"] == "${AuditLogLazyLoadData.module}")`);
    }
    if (searchKey) {
      WhereCondition.push(`|> filter(fn: (r) => strings.containsStr(v : strings.toLower(v : r["performed_module_name_string"]), substr: strings.toLower(v : "${searchKey}")))`);
    }
    const GetEventLogList = await new Promise((resolve, reject) => {
      const result: any = [];
      const observerdata = {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          result.push({
            performed_action: o.performed_action,
            performed_by: o.performed_by,
            performed_by_id: o.performed_by_id,
            performed_module_name: o.performed_module_name,
            performed_module_header_name: o.performed_module_header_name,
            performed_module_id: o.performed_module_id,
            performed_on: new Date(o.performed_on).toLocaleString(),
            performed_type: o.performed_type,
            performed_ipaddress: o.performed_ipaddress,
            performed_parameter: JSON.parse(o._value)
          });
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(result);
        }
      }

      const query = `
      import "strings"
      from(bucket: "${this._ConfigService.get("InfluxDB.INFLUX_BUCKET")}")
          |> range(start: ${new Date(AuditLogLazyLoadData.start_date).toISOString()}, stop: ${new Date(AuditLogLazyLoadData.end_date).toISOString()})
          |> filter(fn: (r) => r["_measurement"] == "${this._ConfigService.get("InfluxDB.INFLUX_DB")}")
          |> filter(fn: (r) => r["_field"] == "performed_parameter")
          |> fill(column:  "performed_module_name",value: "")
          |> map(fn:(r) => ({ r with performed_module_name_string: string(v: r.performed_module_name) }))
          ${WhereCondition.join('\n')}
          |> group()
          |> sort(columns: ["performed_on"], desc : true)
          |> limit(n: ${AuditLogLazyLoadData.take},offset: ${AuditLogLazyLoadData.skip})
      `;
      this.queryApi.queryRows(query, observerdata);

    });
    const GetEventLogCount = await new Promise((resolve, reject) => {
      let total_count: number = 0;
      const observercount = {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          total_count = o._value;
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(total_count);
        }
      }
      const countquery = `
      import "strings"
      from(bucket: "${this._ConfigService.get("InfluxDB.INFLUX_BUCKET")}")
          |> range(start: ${new Date(AuditLogLazyLoadData.start_date).toISOString()}, stop: ${new Date(AuditLogLazyLoadData.end_date).toISOString()})
          |> filter(fn: (r) => r["_measurement"] == "${this._ConfigService.get("InfluxDB.INFLUX_DB")}")
          |> fill(column:  "performed_module_name",value: "")
          |> map(fn:(r) => ({ r with performed_module_name_string: string(v: r.performed_module_name) }))
          ${WhereCondition.join('\n')}
          |> group()
          |> count(column: "_value")
      `;
      this.queryApi.queryRows(countquery, observercount);
    });
    const Result: any = {};
    Result['data'] = GetEventLogList;
    Result['total_record'] = GetEventLogCount;
    return Result;
  }

  async DetailList(EventLog: any) {
    const BooleanColumns = ['is_', 'status'];
    EventLog["audit_log_events"] = [];
    for (const AuditLogEvents of Object.keys(EventLog.performed_parameter).filter(o => !AuditLogRemoveColumnsName.includes(o))) {
      if (EventLog.performed_action == LogActionEnum.Insert || EventLog.performed_action == LogActionEnum.Delete) {
        if (typeof EventLog.performed_parameter[AuditLogEvents] == 'object') {
          if (AuditLogEvents == EventLog.performed_module_header_name) {
            EventLog["audit_log_events"].push(`User <b>${EventLog.performed_by}</b> ${EventLog.performed_action.toUpperCase()} a  <b>${EventLog.performed_type.split('_').join(' ')}</b> ${AuditLogEvents.split('_').join(' ')} to <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents]?.__old == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]?.__old} </b>`);
          }
          else {
            EventLog["audit_log_events"].push(`User <b>${EventLog.performed_by}</b> ${EventLog.performed_action.toUpperCase()} a  <b>${EventLog.performed_type.split('_').join(' ')}</b> ${AuditLogEvents.split('_').join(' ')} of <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents]?.__old == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]?.__old} </b>`);
          }
        }
        else {
          if (AuditLogEvents == EventLog.performed_module_header_name) {
            EventLog["audit_log_events"].push(`User <b>${EventLog.performed_by}</b> ${EventLog.performed_action.toUpperCase()} a  <b>${EventLog.performed_type.split('_').join(' ')}</b> ${AuditLogEvents.split('_').join(' ')} to <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents] == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]}</b>`);
          }
          else {
            EventLog["audit_log_events"].push(`User <b>${EventLog.performed_by}</b> ${EventLog.performed_action.toUpperCase()} a  <b>${EventLog.performed_type.split('_').join(' ')}</b> ${AuditLogEvents.split('_').join(' ')} of <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents] == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]}</b>`);
          }
        }
      }
      else {
        if (typeof EventLog.performed_parameter[AuditLogEvents] == 'object') {
          if (AuditLogEvents == EventLog.performed_module_header_name) {
            EventLog["audit_log_events"].push(`User <b>${EventLog.performed_by}</b> ${EventLog.performed_action.toUpperCase()} a  <b>${EventLog.performed_type.split('_').join(' ')}</b> ${AuditLogEvents.split('_').join(' ')} to <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents]?.__old == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]?.__old}</b> to <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents]?.__new == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]?.__new}</b>`);
          }
          else {
            EventLog["audit_log_events"].push(`User <b>${EventLog.performed_by}</b> ${EventLog.performed_action.toUpperCase()} a  <b>${EventLog.performed_type.split('_').join(' ')}</b> ${AuditLogEvents.split('_').join(' ')} of <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents]?.__old == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]?.__old}</b> to <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents]?.__new == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]?.__new}</b>`);
          }
        }
        else {
          if (AuditLogEvents == EventLog.performed_module_header_name) {
            EventLog["audit_log_events"].push(`User <b>${EventLog.performed_by}</b> ${EventLog.performed_action.toUpperCase()} a  <b>${EventLog.performed_type.split('_').join(' ')}</b> ${AuditLogEvents.split('_').join(' ')} to <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents] == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]}</b>`);
          }
          else {
            EventLog["audit_log_events"].push(`User <b>${EventLog.performed_by}</b> ${EventLog.performed_action.toUpperCase()} a  <b>${EventLog.performed_type.split('_').join(' ')}</b> ${AuditLogEvents.split('_').join(' ')} of <b>${BooleanColumns.some(o => AuditLogEvents.includes(o)) ? (EventLog.performed_parameter[AuditLogEvents] == 1 ? 'Yes' : 'No') : EventLog.performed_parameter[AuditLogEvents]}</b>`);
          }
        }
      }
    }
    return EventLog;
  }

  GetColumneName(table: string, columns: string) {
    let tablename: string = "";
    if (!this.ChangeTableReferenceName[table]) {
      tablename = columns.replace('_id', '');
    }
    else if (this.ChangeTableReferenceName[table][1]?.find(f => f.includes(columns))) {
      tablename = this.ChangeTableReferenceName[table][0].table;
    }
    else {
      tablename = columns.replace('_id', '');
    }
    return this.LogTableIdentifierName[tablename]?.replace("main.", "");
  }

  GetTableName(table: string, columns: string) {
    let tablename = "";
    if (!this.ChangeTableReferenceName[table]) {
      tablename = columns.replace('_id', '');
    }
    else if (this.ChangeTableReferenceName[table][1]?.find(f => f.includes(columns))) {
      tablename = this.ChangeTableReferenceName[table][0].table;
    }
    else {
      tablename = columns.replace('_id', '');
    }
    return tablename;
  }


}

