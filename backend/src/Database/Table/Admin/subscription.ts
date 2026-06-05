import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseTable } from "../BaseTable";
import { company } from "./company";

@Entity()
export class subscription extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: company;

  @Column({ type: 'varchar' })
  plan_id: string;

  @Column({ type: 'varchar', default: 'active' })
  subscription_status: string;

  @Column({ type: 'timestamp', nullable: true })
  current_period_start: Date;

  @Column({ type: 'timestamp', nullable: true })
  current_period_end: Date;

  @Column({ type: 'boolean', default: false })
  cancel_at_period_end: boolean;

  @Column({ type: 'varchar', nullable: true })
  payment_provider_subscription_id: string;
}
