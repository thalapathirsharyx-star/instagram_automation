import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { company } from '../Admin/company';

@Entity()
export class broadcast extends BaseTable {
  @Column({ type: 'uuid', nullable: true })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'draft' })
  broadcast_status: string; // draft | scheduled | sending | completed | failed

  @Column({ type: 'simple-json', nullable: true })
  filters: {
    lead_status?: string[];   // e.g. ['Hot', 'New', 'Buyer']
    tags?: string[];           // filter by tags
    is_qualified?: boolean;
  };

  @Column({ type: 'timestamp', nullable: true })
  scheduled_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @Column({ type: 'int', default: 0 })
  total_recipients: number;

  @Column({ type: 'int', default: 0 })
  sent_count: number;

  @Column({ type: 'int', default: 0 })
  failed_count: number;
}
