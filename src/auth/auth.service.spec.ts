import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BlacklistedTokenRepository } from './blacklisted-token.repository';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockBlacklistedTokenRepo = {
  addToBlacklist: jest.fn(),
  isBlacklisted: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let blacklistedTokenRepo: BlacklistedTokenRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: BlacklistedTokenRepository,
          useValue: mockBlacklistedTokenRepo,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    blacklistedTokenRepo = module.get<BlacklistedTokenRepository>(BlacklistedTokenRepository);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data without password if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'user',
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(authService.validateUser('test@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'user',
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.validateUser('test@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'user' };
      const mockToken = 'mockAccessToken';

      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result).toEqual({ access_token: mockToken });
    });
  });

  describe('register', () => {
    it('should call userService.create with the correct parameters', async () => {
      const userData = { email: 'test@example.com', password: 'password', name: 'Test User' };
      const mockUser = { id: 1, ...userData };

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await authService.register(userData);

      expect(userService.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should call blacklistedTokenRepo.addToBlacklist with the correct parameters', async () => {
      const mockToken = 'mockToken';
      const mockExpiresIn = 3600;

      mockBlacklistedTokenRepo.addToBlacklist.mockResolvedValue(undefined);

      await authService.logout(mockToken, mockExpiresIn);

      const expiresAt = new Date(Date.now() + mockExpiresIn * 1000);

      expect(blacklistedTokenRepo.addToBlacklist).toHaveBeenCalledWith(mockToken, expiresAt);
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should call blacklistedTokenRepo.isBlacklisted with the correct token', async () => {
      const mockToken = 'mockToken';

      mockBlacklistedTokenRepo.isBlacklisted.mockResolvedValue(true);

      const result = await authService.isTokenBlacklisted(mockToken);

      expect(blacklistedTokenRepo.isBlacklisted).toHaveBeenCalledWith(mockToken);
      expect(result).toBe(true);
    });
  });
});