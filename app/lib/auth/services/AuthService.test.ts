import { describe, expect, it, vi } from 'vitest';
import type { IUserDAO } from '../daos/IUserDAO';
import { EmailAlreadyExistsError, IncorrectPasswordError, InvalidPasswordError, UserNotFoundError } from '../errors';
import type { IPasswordHasher } from '../hashers/IPasswordHasher';
import type { User } from '../types/User';
import type { IPasswordValidator } from '../validators/IPasswordValidator';
import { AuthService } from './AuthService';

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    isSuperuser: false,
    ...overrides,
  };
}

describe('AuthService', () => {
  describe('login', () => {
    it('returns user when email and password are valid', async () => {
      const user = createMockUser({ email: 'ok@example.com' });
      const userDao: IUserDAO = {
        findByEmail: vi.fn().mockResolvedValue(user),
        getPasswordHash: vi.fn().mockResolvedValue('hashed'),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const passwordHasher: IPasswordHasher = {
        hash: vi.fn(),
        verify: vi.fn().mockResolvedValue(true),
      };
      const passwordValidator: IPasswordValidator = { validate: vi.fn() };

      const service = new AuthService(userDao, passwordHasher, passwordValidator);
      const result = await service.login('ok@example.com', 'password');

      expect(result).toEqual(user);
      expect(userDao.findByEmail).toHaveBeenCalledWith('ok@example.com');
      expect(passwordHasher.verify).toHaveBeenCalledWith('password', 'hashed');
    });

    it('throws UserNotFoundError when user does not exist', async () => {
      const userDao: IUserDAO = {
        findByEmail: vi.fn().mockResolvedValue(null),
        getPasswordHash: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const passwordHasher: IPasswordHasher = { hash: vi.fn(), verify: vi.fn() };
      const passwordValidator: IPasswordValidator = { validate: vi.fn() };

      const service = new AuthService(userDao, passwordHasher, passwordValidator);

      await expect(service.login('missing@example.com', 'password')).rejects.toThrow(UserNotFoundError);
      expect(userDao.findByEmail).toHaveBeenCalledWith('missing@example.com');
      expect(passwordHasher.verify).not.toHaveBeenCalled();
    });

    it('throws IncorrectPasswordError when password does not match', async () => {
      const user = createMockUser();
      const userDao: IUserDAO = {
        findByEmail: vi.fn().mockResolvedValue(user),
        getPasswordHash: vi.fn().mockResolvedValue('hashed'),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const passwordHasher: IPasswordHasher = {
        hash: vi.fn(),
        verify: vi.fn().mockResolvedValue(false),
      };
      const passwordValidator: IPasswordValidator = { validate: vi.fn() };

      const service = new AuthService(userDao, passwordHasher, passwordValidator);

      await expect(service.login('user@example.com', 'wrong')).rejects.toThrow(IncorrectPasswordError);
      expect(passwordHasher.verify).toHaveBeenCalledWith('wrong', 'hashed');
    });
  });

  describe('signup', () => {
    it('creates user when password is valid and email is unique', async () => {
      const user = createMockUser({ id: 'new-id', email: 'new@example.com' });
      const userDao: IUserDAO = {
        findByEmail: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(user),
        getPasswordHash: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const passwordHasher: IPasswordHasher = {
        hash: vi.fn().mockResolvedValue('hashedPassword'),
        verify: vi.fn(),
      };
      const passwordValidator: IPasswordValidator = {
        validate: vi.fn().mockReturnValue({ valid: true }),
      };

      const service = new AuthService(userDao, passwordHasher, passwordValidator);
      const result = await service.signup('new@example.com', 'ValidPass1!');

      expect(result).toEqual(user);
      expect(passwordValidator.validate).toHaveBeenCalledWith('ValidPass1!');
      expect(passwordHasher.hash).toHaveBeenCalledWith('ValidPass1!');
      expect(userDao.create).toHaveBeenCalledWith('new@example.com', 'hashedPassword');
    });

    it('throws InvalidPasswordError when password validation fails', async () => {
      const userDao: IUserDAO = {
        findByEmail: vi.fn(),
        create: vi.fn(),
        getPasswordHash: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const passwordHasher: IPasswordHasher = { hash: vi.fn(), verify: vi.fn() };
      const passwordValidator: IPasswordValidator = {
        validate: vi.fn().mockReturnValue({ valid: false, error: 'Too weak' }),
      };

      const service = new AuthService(userDao, passwordHasher, passwordValidator);

      await expect(service.signup('new@example.com', 'weak')).rejects.toThrow(InvalidPasswordError);
      expect(passwordValidator.validate).toHaveBeenCalledWith('weak');
      expect(passwordHasher.hash).not.toHaveBeenCalled();
      expect(userDao.create).not.toHaveBeenCalled();
    });

    it('throws EmailAlreadyExistsError when email is already taken', async () => {
      const existingUser = createMockUser({ email: 'taken@example.com' });
      const userDao: IUserDAO = {
        findByEmail: vi.fn().mockResolvedValue(existingUser),
        create: vi.fn(),
        getPasswordHash: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const passwordHasher: IPasswordHasher = {
        hash: vi.fn().mockResolvedValue('hashed'),
        verify: vi.fn(),
      };
      const passwordValidator: IPasswordValidator = {
        validate: vi.fn().mockReturnValue({ valid: true }),
      };

      const service = new AuthService(userDao, passwordHasher, passwordValidator);

      await expect(service.signup('taken@example.com', 'ValidPass1!')).rejects.toThrow(EmailAlreadyExistsError);
      expect(userDao.create).not.toHaveBeenCalled();
    });
  });

  describe('checkEmailExists', () => {
    it('returns true when user exists', async () => {
      const user = createMockUser();
      const userDao: IUserDAO = {
        findByEmail: vi.fn().mockResolvedValue(user),
        getPasswordHash: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const service = new AuthService(userDao, {} as IPasswordHasher, {} as IPasswordValidator);

      const result = await service.checkEmailExists('user@example.com');

      expect(result).toBe(true);
      expect(userDao.findByEmail).toHaveBeenCalledWith('user@example.com');
    });

    it('returns false when user does not exist', async () => {
      const userDao: IUserDAO = {
        findByEmail: vi.fn().mockResolvedValue(null),
        getPasswordHash: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const service = new AuthService(userDao, {} as IPasswordHasher, {} as IPasswordValidator);

      const result = await service.checkEmailExists('missing@example.com');

      expect(result).toBe(false);
    });
  });
});
