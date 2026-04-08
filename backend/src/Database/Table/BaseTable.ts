/**
 * @author VarunAnand
 */
import { AuditLogRemoveColumn } from '@Helper/AuditLog.decorators';
import { Column, BaseEntity, Index, PrimaryColumn, Generated } from 'typeorm';

export class BaseTable extends BaseEntity {
  @PrimaryColumn()
  @Index()
  @Generated('uuid')
  id: string;

  @Column({ type: 'boolean', default: 1 })
  status: boolean;

  @AuditLogRemoveColumn()
  @Column({ select: false })
  created_by_id: string;

  @AuditLogRemoveColumn()
  @Column({ type: 'datetime', select: false })
  created_on: Date;

  @AuditLogRemoveColumn()
  @Column({ nullable: true, select: false })
  updated_by_id?: string;

  @AuditLogRemoveColumn()
  @Column({ type: 'datetime', nullable: true, select: false })
  updated_on?: Date;

}
