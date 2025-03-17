import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.findByEmail('test@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await userService.findByEmail('test@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a user with a hashed password', async () => {
      const userData = { email: 'test@example.com', password: 'password', role: UserRole.VIEWER };
      const mockUser = { id: 1, ...userData, password: 'hashedPassword' };
  
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));
  
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
  
      const result = await userService.create(userData);
  
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
  
      expect(userRepository.create).toHaveBeenCalledWith({
        email: userData.email,
        password: 'hashedPassword',
        role: userData.role,
      });
  
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: 1, email: 'test1@example.com', password: 'hashedPassword1' },
        { id: 2, email: 'test2@example.com', password: 'hashedPassword2' },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('updateRole', () => {
    it('should update the user role', async () => {
      const userId = 1;
      const newRole = UserRole.ADMIN;

      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await userService.updateRole(userId, newRole);

      expect(userRepository.update).toHaveBeenCalledWith(userId, { role: newRole });
      expect(result).toEqual({ affected: 1 });
    });
  });
});