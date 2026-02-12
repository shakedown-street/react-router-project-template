import type { PrismaClient } from 'prisma/generated/client';
import { storage } from './config';
import { BcryptPasswordHasher } from './hashers/BcryptPasswordHasher';
import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { AuthService } from './services/AuthService';
import { SessionService } from './services/SessionService';
import { ZodPasswordValidator } from './validators/ZodPasswordValidator';

export class AuthServiceFactory {
  static create(prisma: PrismaClient): {
    authService: AuthService;
    sessionService: SessionService;
  } {
    const userRepository = new PrismaUserRepository(prisma);
    const passwordHasher = new BcryptPasswordHasher();
    const passwordValidator = new ZodPasswordValidator();

    const authService = new AuthService(userRepository, passwordHasher, passwordValidator);
    const sessionService = new SessionService(storage, userRepository);

    return {
      authService,
      sessionService,
    };
  }
}
