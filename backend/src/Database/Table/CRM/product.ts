import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { company } from '../Admin/company';

@Entity()
export class product extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  price: number;

  @Column({ type: 'text', nullable: true })
  variants: string; // JSON string: {"sizes": ["S", "M"], "colors": ["Red"]}

  @Column({ type: 'integer', default: 0 })
  stock_quantity: number;

  @Column({ type: 'text', nullable: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  images: string; // Comma-separated image URLs or JSON list

  @Column({ type: 'text', nullable: true })
  description: string;
}
