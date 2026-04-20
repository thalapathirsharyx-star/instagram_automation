import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { instagram_lead } from './instagram_lead';
import { company } from '../Admin/company';

@Entity()
export class instagram_message extends BaseTable {
  @Column({ type: 'uuid', nullable: true })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ type: 'uuid' })
  @Index()
  lead_id: string;

  @ManyToOne(() => instagram_lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: instagram_lead;

  @Column({ type: 'text' })
  message_text: string;

  @Column({ default: 'Inbound' })
  direction: string; // Inbound | Outbound

  @Column({ nullable: true })
  action_taken: string; // AUTO_KEYWORD_REPLY | AI_REPLY | HUMAN_HANDOFF | etc.

  @Column({ type: 'text', nullable: true })
  ai_notes: string;
}
