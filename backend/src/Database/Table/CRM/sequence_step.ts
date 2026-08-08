import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { sequence } from './sequence';

@Entity()
export class sequence_step extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  sequence_id: string;

  @ManyToOne(() => sequence, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sequence_id' })
  sequence: sequence;

  @Column({ type: 'int' })
  step_order: number;

  @Column({ type: 'text' })
  step_type: string; // MESSAGE | DELAY | CONDITION

  @Column({ type: 'simple-json', nullable: true })
  config: {
    message_text?: string;
    delay_hours?: number;
    condition_type?: string; // NO_REPLY | CLICKED_LINK
  };
}
