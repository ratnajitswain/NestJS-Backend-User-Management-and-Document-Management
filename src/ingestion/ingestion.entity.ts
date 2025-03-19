import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Document } from '../document/document.entity';

export enum IngestionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class Ingestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Document, (document) => document.id)
  document: Document;

  @Column({ type: 'enum', enum: IngestionStatus, default: IngestionStatus.PENDING })
  status: IngestionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
