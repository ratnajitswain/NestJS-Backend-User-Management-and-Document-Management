import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

const mockUserService = {
  findByEmail: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com', password: 'hashedpassword' }),
  createUser: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mockToken'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should login user and return JWT', async () => {
    const result = await authService.validateUser('test@example.com', 'password');
    expect(result).toHaveProperty('access_token', 'mockToken');
  });

  it('should register a user', async () => {
    const result = await authService.register({ email: 'test@example.com', password: 'password' });
    expect(result).toHaveProperty('id', 1);
  });
});
