import { EmailAlreadyExistsError, IncorrectPasswordError, InvalidPasswordError, UserNotFoundError } from '../errors';
import type { PasswordHasher } from '../hashers/PasswordHasher';
import type { UserRepository } from '../repositories/UserRepository';
import type { User } from '../types/User';
import type { PasswordValidator } from '../validators/PasswordValidator';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private passwordValidator: PasswordValidator,
  ) {}

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (user === null) {
      throw new UserNotFoundError();
    }

    const isValid = await this.passwordHasher.verify(password, user.password);
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

    const user = await this.userRepository.create(email, hashedPassword);
    return user;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    return user !== null;
  }
}
