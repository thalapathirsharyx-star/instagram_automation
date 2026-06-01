import { AuditLogIdentity } from "@Helper/AuditLog.decorators";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseTable } from "../BaseTable";
import { country } from "./country";
import { currency } from "./currency";
import { user } from "./user";

@Entity()
export class company extends BaseTable {

  @AuditLogIdentity()
  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ type: 'uuid' })
  @Index()
  country_id: string;

  @ManyToOne(() => country, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "country_id" })
  country: country;

  @Column({ type: 'uuid' })
  @Index()
  currency_id: string;

  @Column({ type: 'text', nullable: true })
  system_prompt: string;

  @OneToMany(() => user, (u) => u.company)
  users: user[];

  @ManyToOne(() => currency, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "currency_id" })
  currency: currency;

  @Column()
  postal_code: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  uen_no: string;

  @Column({ nullable: true })
  bank_name: string;

  @Column({ nullable: true })
  bank_acct_no: string;

  @Column({ nullable: true })
  telephone_no: string;

  @Column({ nullable: true })
  fax_no: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  wallet_balance: number;

  @Column({ nullable: true })
  invoice_footer: string;

  @Column({ nullable: true })
  instagram_business_id: string;

  @Column({ nullable: true })
  instagram_page_id: string;

  @Column({ type: 'text', nullable: true })
  instagram_access_token: string;

  @Column({ nullable: true })
  instagram_app_id: string;

  @Column({ nullable: true })
  instagram_app_secret: string;

  @Column({ nullable: true })
  instagram_username: string;

  @Column({ type: 'text', nullable: true })
  instagram_profile_picture_url: string;

  @Column({ type: 'text', nullable: true })
  welcome_message: string;

  @Column({ type: 'jsonb', nullable: true })
  business_profile: any;

  @Column({ type: 'jsonb', nullable: true })
  lead_rules: any;

  @Column({ type: 'jsonb', nullable: true })
  playbook_steps: any;

  @Column({ type: 'text', default: 'Free' })
  plan: string;

  @Column({ type: 'timestamp', nullable: true })
  plan_expires_at: Date;

  @Column({ type: 'int', default: 0 })
  monthly_ai_usage: number;

  @Column({ type: 'text', nullable: true })
  ai_usage_reset_month: string; // e.g. "2026-05" — used to auto-reset monthly_ai_usage

  @Column({ type: 'text', default: 'UTC' })
  timezone: string;

  @Column({ type: 'text', default: '00:00' })
  working_hours_start: string;

  @Column({ type: 'text', default: '23:59' })
  working_hours_end: string;

  @Column({ type: 'text', nullable: true })
  ooo_message: string;

  @Column({ type: 'boolean', default: false })
  auto_follow_up_enabled: boolean;

  @Column({ type: 'int', default: 24 })
  auto_follow_up_delay_hours: number;

  @Column({ type: 'text', nullable: true })
  auto_follow_up_message: string;

  @Column({ type: 'boolean', default: false })
  story_mention_enabled: boolean;

  @Column({ type: 'text', nullable: true })
  story_mention_message: string;

  @Column({ type: 'boolean', default: true })
  auto_reply_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  human_handoff_alerts: boolean;
}
