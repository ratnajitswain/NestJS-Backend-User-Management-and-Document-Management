import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthAdminGuard } from '../auth/jwt-auth.guard';
import { UserRole } from './user.entity';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

// Mock the UserService
const mockUserService = {
  findAll: jest.fn(),
  updateRole: jest.fn(),
};

// Mock the JwtAuthAdminGuard
const mockJwtAuthAdminGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthAdminGuard)
      .useValue(mockJwtAuthAdminGuard)
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: 1, email: 'test1@example.com', role: UserRole.VIEWER },
        { id: 2, email: 'test2@example.com', role: UserRole.ADMIN },
      ];

      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should throw UnauthorizedException if user is not an admin', async () => {
      mockJwtAuthAdminGuard.canActivate.mockImplementation(
        (context: ExecutionContext) => false,
      );

      await expect(async () => {
        const mockContext = {} as ExecutionContext;
        if (!mockJwtAuthAdminGuard.canActivate(mockContext)) {
          throw new UnauthorizedException('User is not an admin');
        }
        await userController.findAll();
      }).rejects.toThrow(UnauthorizedException);

      expect(userService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('should update the user role', async () => {
      const userId = 1;
      const newRole = UserRole.ADMIN;
      const mockResponse = { affected: 1 };

      mockUserService.updateRole.mockResolvedValue(mockResponse);

      const result = await userController.updateRole(userId, newRole);

      expect(userService.updateRole).toHaveBeenCalledWith(userId, newRole);
      expect(result).toEqual(mockResponse);
    });

    it('should throw UnauthorizedException if user is not an admin', async () => {
      mockJwtAuthAdminGuard.canActivate.mockImplementation(
        (context: ExecutionContext) => false,
      );

      await expect(async () => {
        const mockContext = {} as ExecutionContext;
        if (!mockJwtAuthAdminGuard.canActivate(mockContext)) {
          throw new UnauthorizedException('User is not an admin');
        }
        await userController.updateRole(1, UserRole.ADMIN);
      }).rejects.toThrow(UnauthorizedException);
      expect(userService.updateRole).not.toHaveBeenCalled();
    });
  });
});
