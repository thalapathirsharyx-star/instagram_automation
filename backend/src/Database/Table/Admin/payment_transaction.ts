import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "./company";
import { invoice } from "./invoice";

@Entity()
export class payment_transaction extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: company;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  invoice_id: string;

  @ManyToOne(() => invoice, { onDelete: "SET NULL" })
  @JoinColumn({ name: "invoice_id" })
  invoice: invoice;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'varchar', default: 'pending' })
  payment_status: string;

  @Column({ type: 'varchar' })
  payment_method: string;

  @Column({ type: 'varchar', nullable: true })
  provider_transaction_id: string;

  @Column({ type: 'jsonb', nullable: true })
  provider_response: any;
}
