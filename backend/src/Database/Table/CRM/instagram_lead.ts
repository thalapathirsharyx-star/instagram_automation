import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { company } from '../Admin/company';

@Entity()
@Unique(['instagram_handle', 'company_id'])
export class instagram_lead extends BaseTable {
  @Column({ type: 'uuid', nullable: true })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ type: 'text' })
  customer_name: string;

  @Column()
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

  @Column({ type: 'boolean', default: false })
  is_qualified: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  lead_score: number;

  @Column({ type: 'text', nullable: true })
  last_intent: string;

  @Column({ type: 'text', nullable: true })
  conversation_summary: string;
}
