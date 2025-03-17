import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole } from './user.entity';
import { JwtAuthAdminGuard } from '../auth/jwt-auth.guard';
import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthAdminGuard)
  async findAll() {
    return this.userService.findAll();
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthAdminGuard)
  async updateRole(@Param('id') id: number, @Body('role') role: UserRole) {
    return this.userService.updateRole(id, role);
  }
}
