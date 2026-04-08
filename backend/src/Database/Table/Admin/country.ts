import { AuditLogIdentity } from "@Helper/AuditLog.decorators";
import { Entity, Column, JoinColumn, ManyToOne, Index } from "typeorm";
import { BaseTable } from "../BaseTable";
import { currency } from "./currency";

@Entity()
export class country extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  currency_id: string;

  @ManyToOne(() => currency, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "currency_id" })
  currency: currency;

  @AuditLogIdentity()
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

}
