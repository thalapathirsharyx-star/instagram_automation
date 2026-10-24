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

  @Column({ type: 'boolean', default: false })
  follow_up_sent: boolean;

  @Column({ type: 'uuid', nullable: true })
  last_story_context_id: string;

  /**
   * True while a human agent has taken over this conversation. The automation engine must
   * not auto-reply while this is set, otherwise the AI talks over the agent.
   *
   * Needs a migration when DB_SYNC is false:
   *   ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS human_agent_active boolean NOT NULL DEFAULT false;
   *   ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS assigned_agent_id uuid;
   *   ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS handoff_at timestamp;
   */
  @Column({ type: 'boolean', default: false })
  human_agent_active: boolean;

  /** The user who claimed the conversation — the "human agent" for Meta's purposes. */
  @Column({ type: 'uuid', nullable: true })
  assigned_agent_id: string;

  @Column({ type: 'timestamp', nullable: true })
  handoff_at: Date;
}
