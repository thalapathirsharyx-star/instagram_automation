import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { company } from '../Admin/company';

@Entity()
export class instagram_lead extends BaseTable {
  @Column({ type: 'uuid', nullable: true })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ type: 'text' })
  customer_name: string;

  @Column({ unique: true })
  @Index()
  instagram_handle: string;

  @Column({ default: 'New' })
  lead_status: string; // New | Hot | Buyer | Lost | Needs_Human

  @Column({ type: 'timestamp', nullable: true })
  last_message_time: Date;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;
}
