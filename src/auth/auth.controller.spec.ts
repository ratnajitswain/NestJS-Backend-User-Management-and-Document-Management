import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should call authService.register with the correct parameters', async () => {
      const userData = { email: 'test@example.com', password: 'password', name: 'Test User' };
      await authController.register(userData);
      expect(authService.register).toHaveBeenCalledWith(userData);
    });
  });

  describe('login', () => {
    it('should call authService.login with the correct parameters', async () => {
      const loginData = { email: 'test@example.com', password: 'password' };
      await authController.login(loginData);
      expect(authService.login).toHaveBeenCalledWith(loginData);
    });
  });

  describe('getProfile', () => {
    it('should return the user from the request', async () => {
      const mockUser = { userId: 1, email: 'test@example.com' };
      const mockRequest = { user: mockUser };
      const result = await authController.getProfile(mockRequest);
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with the correct parameters', async () => {
      const mockToken = 'mockToken';
      const mockExp = Math.floor(Date.now() / 1000) + 3600;
      const mockRequest = {
        headers: { authorization: `Bearer ${mockToken}` },
        user: { exp: mockExp },
      };

      await authController.logout(mockRequest);
      const expiresIn = mockExp - Math.floor(Date.now() / 1000);
      expect(authService.logout).toHaveBeenCalledWith(mockToken, expiresIn);
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const mockRequest = { headers: {} };
      await expect(authController.logout(mockRequest)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer mockToken' },
        user: {},
      };
      await expect(authController.logout(mockRequest)).rejects.toThrow(UnauthorizedException);
    });
  });
});