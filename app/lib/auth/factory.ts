import { PrismaUserDAO } from './daos/PrismaUserDAO';
import { BcryptPasswordHasher } from './hashers/BcryptPasswordHasher';
import { AuthService } from './services/AuthService';
import { SessionService } from './services/SessionService';
import { ZodPasswordValidator } from './validators/ZodPasswordValidator';

export function getAuthService() {
  const userDao = new PrismaUserDAO();
  const passwordHasher = new BcryptPasswordHasher();
  const passwordValidator = new ZodPasswordValidator();

  return new AuthService(userDao, passwordHasher, passwordValidator);
}

export function getSessionService() {
  const userDao = new PrismaUserDAO();

  return new SessionService(userDao);
}
