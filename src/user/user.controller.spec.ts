import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
  getAllUsers: jest.fn().mockResolvedValue([{ id: 1, email: 'test@example.com' }]),
  getUserById: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
  updateUser: jest.fn().mockResolvedValue({ id: 1, email: 'updated@example.com' }),
  deleteUser: jest.fn().mockResolvedValue({ message: 'User deleted' }),
};

describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  it('should get all users', async () => {
    const result = await userController.getAllUsers();
    expect(result).toEqual([{ id: 1, email: 'test@example.com' }]);
  });

  it('should get a user by ID', async () => {
    const result = await userController.getUserById(1);
    expect(result).toEqual({ id: 1, email: 'test@example.com' });
  });

  it('should update a user', async () => {
    const result = await userController.updateUser(1, { email: 'updated@example.com' });
    expect(result).toEqual({ id: 1, email: 'updated@example.com' });
  });

  it('should delete a user', async () => {
    const result = await userController.deleteUser(1);
    expect(result).toEqual({ message: 'User deleted' });
  });
});
