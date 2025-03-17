import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;
}