import type { IAuthenticationService } from './IAuthenticationService';
import { EmailAlreadyExistsError, IncorrectPasswordError, InvalidPasswordError, UserNotFoundError } from '../errors';
import type { IUserRepository } from '../repositories/IUserRepository';
import type { IUser } from '../types/IUser';
import type { IPasswordValidator } from '../validators/IPasswordValidator';
import type { IPasswordService } from './IPasswordService';

export class AuthenticationService implements IAuthenticationService {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: IPasswordService,
    private passwordValidator: IPasswordValidator,
  ) {}

  async login(email: string, password: string): Promise<IUser> {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (user === null) {
      throw new UserNotFoundError();
    }

    const isValid = await this.passwordService.verify(password, user.password);
    if (!isValid) {
      throw new IncorrectPasswordError();
    }

    return user;
  }

  async signup(email: string, password: string): Promise<IUser> {
    const validationResult = this.passwordValidator.validate(password);
    if (!validationResult.valid) {
      throw new InvalidPasswordError(validationResult.error);
    }

    const hashedPassword = await this.passwordService.hash(password);

    const emailExists = await this.checkEmailExists(email);
    if (emailExists) {
      throw new EmailAlreadyExistsError(email);
    }

    const user = await this.userRepository.create(email, hashedPassword);
    return user;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    return user !== null;
  }
}
