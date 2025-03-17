import { Controller, Post, Body, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: { email: string; password: string, name:string }) {

    const {email, password, name} = userData
    return this.authService.register({email, password, name});
  }

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    return this.authService.login(loginData);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException('No token provided');

    const { exp } = req.user;
    if (!exp) throw new UnauthorizedException('Invalid token');

    const expiresIn = exp - Math.floor(Date.now() / 1000);
    await this.authService.logout(token, expiresIn);

    return { message: 'Logout successful' };
  }
}
