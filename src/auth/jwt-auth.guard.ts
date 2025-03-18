import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../user/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    const [, token] = authHeader.split(' ');
    try {
      if (await this.authService.isTokenBlacklisted(token)) {
        return false;
      }
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      return true;
    } catch (err) {
      console.error('JWT verification failed:', err);
      return false;
    }
  }
}

@Injectable()
export class JwtAuthAdminGuard extends JwtAuthGuard {
  constructor(jwtService: JwtService, authService: AuthService) {
    super(jwtService, authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) return false;

    const request = context.switchToHttp().getRequest();
    return request.user.role === UserRole.ADMIN;
  }
}
