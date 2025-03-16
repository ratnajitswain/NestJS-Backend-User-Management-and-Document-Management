import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: { email: string; password: string; role?: UserRole }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({ ...userData, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async updateRole(id: number, role: UserRole) {
    return this.userRepository.update(id, { role });
  }
}
