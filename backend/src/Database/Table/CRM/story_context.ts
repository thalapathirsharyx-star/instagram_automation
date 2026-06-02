import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { company } from '../Admin/company';

@Entity()
export class story_context extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ unique: true })
  @Index()
  instagram_story_id: string;

  @Column({ type: 'text', nullable: true })
  story_media_url: string;

  @Column({ type: 'text', nullable: true })
  ocr_text: string;

  @Column({ type: 'jsonb', nullable: true })
  structured_data: {
    product_name?: string;
    price?: number;
    sizes?: string[];
    customer_context?: string;
    [key: string]: any;
  };
}
