import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard, JwtAuthAdminGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { ExecutionContext } from '@nestjs/common';

const mockJwtService = {
  verify: jest.fn(),
};

const mockAuthService = {
  isTokenBlacklisted: jest.fn(),
};

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtService: JwtService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should return true if token is valid and not blacklisted', async () => {
    const mockRequest = {
      user:{},
      headers: {
        authorization: 'Bearer validToken',
      },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    mockAuthService.isTokenBlacklisted.mockResolvedValue(false);
    mockJwtService.verify.mockReturnValue({ userId: 1, email: 'test@example.com' });

    const result = await jwtAuthGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockAuthService.isTokenBlacklisted).toHaveBeenCalledWith('validToken');
    expect(mockJwtService.verify).toHaveBeenCalledWith('validToken');
    expect(mockRequest.user).toEqual({ userId: 1, email: 'test@example.com' });
  });

  it('should return false if token is blacklisted', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer blacklistedToken',
      },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    mockAuthService.isTokenBlacklisted.mockResolvedValue(true);

    const result = await jwtAuthGuard.canActivate(mockContext);

    expect(result).toBe(false);
    expect(mockAuthService.isTokenBlacklisted).toHaveBeenCalledWith('blacklistedToken');
  });

  it('should return false if token is invalid', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer invalidToken',
      },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    mockAuthService.isTokenBlacklisted.mockResolvedValue(false);
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const result = await jwtAuthGuard.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it('should return false if authorization header is missing', async () => {
    const mockRequest = {
      headers: {},
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = await jwtAuthGuard.canActivate(mockContext);

    expect(result).toBe(false);
  });
});

describe('JwtAuthAdminGuard', () => {
  let jwtAuthAdminGuard: JwtAuthAdminGuard;
  let jwtService: JwtService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthAdminGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    jwtAuthAdminGuard = module.get<JwtAuthAdminGuard>(JwtAuthAdminGuard);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should return true if user is an admin', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer validToken',
      },
      user: {
        role: 'admin',
      },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    mockAuthService.isTokenBlacklisted.mockResolvedValue(false);
    mockJwtService.verify.mockReturnValue({ userId: 1, email: 'test@example.com', role: 'admin' });

    const result = await jwtAuthAdminGuard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should return false if user is not an admin', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer validToken',
      },
      user: {
        role: 'USER',
      },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    mockAuthService.isTokenBlacklisted.mockResolvedValue(false);
    mockJwtService.verify.mockReturnValue({ userId: 1, email: 'test@example.com', role: 'USER' });

    const result = await jwtAuthAdminGuard.canActivate(mockContext);

    expect(result).toBe(false);
  });
});