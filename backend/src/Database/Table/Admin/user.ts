/**
 * @author VarunAnand
 */
import { AuditLogIdentity, AuditLogTableRemoveColumns } from '@Helper/AuditLog.decorators';
import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { user_role } from './user_role';
import { company } from './company';

@Entity()
export class user extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  user_role_id: string;

  @ManyToOne(() => user_role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_role_id' })
  user_role: user_role;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ type: "text", nullable: true })
  first_name: string;

  @Column({ type: "text", nullable: true })
  last_name: string;

  @AuditLogIdentity()
  @Column({ unique: true })
  email: string;

  @AuditLogTableRemoveColumns()
  @Column({ type: 'text' })
  password: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ type: "bigint", nullable: true })
  reset_otp: number;

  @Column({ type: 'text', nullable: true })
  super_admin_sub_role: 'Owner' | 'Support' | 'Security';

  @Column({ type: 'boolean', default: false })
  two_factor_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'text', nullable: true })
  two_factor_secret: string;

  @Column({ type: 'json', nullable: true })
  two_factor_recovery_codes: string[];

  @Column({ type: 'timestamp', nullable: true })
  two_factor_enforced_at: Date;

  @Column({ type: 'text', nullable: true })
  last_login_ip: string;

  @Column({ type: 'integer', default: 0 })
  failed_login_count: number;
}
