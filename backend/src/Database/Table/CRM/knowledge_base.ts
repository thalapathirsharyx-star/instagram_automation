import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../BaseTable';
import { company } from '../Admin/company';

@Entity()
export class knowledge_base extends BaseTable {
  @Column({ type: 'uuid' })
  @Index()
  company_id: string;

  @ManyToOne(() => company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: company;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  category: string; // e.g., 'Pricing', 'Shipping', 'Size Guide'

  // This will store the vector embedding for RAG search
  // Note: We use 'text' here and cast in raw queries if pgvector is not installed, 
  // or use 'vector' if the extension is enabled.
  @Column({ type: 'text', nullable: true })
  embedding: string; 
}
