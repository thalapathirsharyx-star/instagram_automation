import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { company } from '../Admin/company';

@Entity()
export class comment_trigger extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ type: 'text' })
  post_title: string;

  @Column({ type: 'text' })
  keyword: string;

  @Column({ type: 'text' })
  reply_message: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
