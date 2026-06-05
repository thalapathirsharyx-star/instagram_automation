import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "./company";

@Entity()
export class invoice extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: company;

  @Column({ type: 'varchar', unique: true })
  invoice_number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount_due: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_paid: number;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'varchar', default: 'draft' })
  invoice_status: string;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({ type: 'varchar', nullable: true })
  payment_provider_invoice_id: string;

  @Column({ type: 'text', nullable: true })
  hosted_invoice_url: string;
}
