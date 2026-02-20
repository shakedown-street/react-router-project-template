import type { IUserDAO } from '../daos/IUserDAO';
import { EmailAlreadyExistsError, IncorrectPasswordError, InvalidPasswordError, UserNotFoundError } from '../errors';
import type { IPasswordHasher } from '../hashers/IPasswordHasher';
import type { User } from '../types/User';
import type { IPasswordValidator } from '../validators/IPasswordValidator';
import type { IAuthService } from './IAuthService';

export class AuthService implements IAuthService {
  constructor(
    private userDao: IUserDAO,
    private passwordHasher: IPasswordHasher,
    private passwordValidator: IPasswordValidator,
  ) {}

  async login(email: string, password: string): Promise<User> {
    const user = await this.userDao.findByEmail(email);
    if (user === null) {
      throw new UserNotFoundError();
    }

    const passwordHash = await this.userDao.getPasswordHash(email);
    const isValid = await this.passwordHasher.verify(password, passwordHash);
    if (!isValid) {
      throw new IncorrectPasswordError();
    }

    return user;
  }

  async signup(email: string, password: string): Promise<User> {
    const validationResult = this.passwordValidator.validate(password);
    if (!validationResult.valid) {
      throw new InvalidPasswordError(validationResult.error);
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const emailExists = await this.checkEmailExists(email);
    if (emailExists) {
      throw new EmailAlreadyExistsError(email);
    }

    const user = await this.userDao.create(email, hashedPassword);
    return user;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.userDao.findByEmail(email);
    return user !== null;
  }
}
