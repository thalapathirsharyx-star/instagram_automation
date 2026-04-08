import { Entity, Column, Index } from 'typeorm';
import { BaseTable } from '../BaseTable';

@Entity()
export class instagram_lead extends BaseTable {
  @Column({ type: 'text' })
  customer_name: string;

  @Column({ unique: true })
  @Index()
  instagram_handle: string;

  @Column({ default: 'New' })
  lead_status: string; // New | Hot | Buyer | Lost | Needs_Human

  @Column({ type: 'datetime', nullable: true })
  last_message_time: Date;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;
}
