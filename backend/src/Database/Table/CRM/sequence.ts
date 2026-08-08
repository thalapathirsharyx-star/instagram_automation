import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { company } from '../Admin/company';

@Entity()
export class sequence extends BaseTable {
  @Column({ type: 'uuid', nullable: true })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ type: 'text' })
  name: string;

  @Column({ default: 'draft' })
  sequence_status: string; // draft | active | paused

  @Column({ type: 'simple-json', nullable: true })
  trigger_filters: {
    lead_status?: string[];
    tags?: string[];
    is_qualified?: boolean;
  };

  @Column({ type: 'int', default: 0 })
  total_enrolled: number;

  @Column({ type: 'int', default: 0 })
  total_completed: number;
}
