import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class system_setting extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  setting_key: string;

  @Column({ type: "text", nullable: true })
  setting_value: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @Column({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP' })
  updated_on: Date;
}
