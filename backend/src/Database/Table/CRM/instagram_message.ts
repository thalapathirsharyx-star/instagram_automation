import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { instagram_lead } from './instagram_lead';

@Entity()
export class instagram_message extends BaseTable {
  @ManyToOne(() => instagram_lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: instagram_lead;

  @Column()
  @Index()
  lead_id: string;

  @Column({ type: 'text' })
  message_text: string;

  @Column({ default: 'Inbound' })
  direction: string; // Inbound | Outbound

  @Column({ nullable: true })
  action_taken: string; // AUTO_KEYWORD_REPLY | AI_REPLY | HUMAN_HANDOFF | etc.

  @Column({ type: 'text', nullable: true })
  ai_notes: string;
}
