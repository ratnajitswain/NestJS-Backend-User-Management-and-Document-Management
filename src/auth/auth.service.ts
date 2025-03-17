import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BlacklistedTokenRepository } from './blacklisted-token.repository';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(BlacklistedTokenRepository)
    private readonly blacklistedTokenRepo: BlacklistedTokenRepository,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userData: any) {
    return this.userService.create(userData);
  }
  async logout(token: string, expiresIn: number): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    await this.blacklistedTokenRepo.addToBlacklist(token, expiresAt);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return await this.blacklistedTokenRepo.isBlacklisted(token);
  }
}
