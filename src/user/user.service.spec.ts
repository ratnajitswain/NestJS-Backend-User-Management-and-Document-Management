import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

const mockUserRepository = {
  save: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
  findOne: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should find user by email', async () => {
    const result = await userService.findByEmail('test@example.com');
    expect(result).toHaveProperty('id', 1);
  });
});
