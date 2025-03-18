import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.id)
  owner: User;

  @ManyToMany(() => User)
  @JoinTable()
  editors: User[];

  @ManyToMany(() => User)
  @JoinTable()
  viewers: User[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  filePath: string;
}
