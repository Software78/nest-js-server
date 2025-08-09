import { Exclude } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Generated,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date | null;
}