import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { sequence } from './sequence';
import { instagram_lead } from './instagram_lead';

@Entity()
export class sequence_enrollment extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  sequence_id: string;

  @ManyToOne(() => sequence, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sequence_id' })
  sequence: sequence;

  @Column({ type: 'uuid' })
  @Index()
  lead_id: string;

  @ManyToOne(() => instagram_lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: instagram_lead;

  @Column({ type: 'int', default: 0 })
  current_step_order: number;

  @Column({ default: 'active' })
  enrollment_status: string; // active | completed | cancelled | paused

  @Column({ type: 'timestamp', nullable: true })
  next_step_execution_time: Date;
}
