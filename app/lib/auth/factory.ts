import type { PrismaClient } from 'prisma/generated/client';
import { storage } from './config';
import { BcryptPasswordHasher } from './hashers/BcryptPasswordHasher';
import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { BaseAuthenticationService } from './services/BaseAuthenticationService';
import { ReactRouterSessionService } from './services/ReactRouterSessionService';
import { ZodPasswordValidator } from './validators/ZodPasswordValidator';

export class AuthServiceFactory {
  static create(prisma: PrismaClient): {
    authService: BaseAuthenticationService;
    sessionManager: ReactRouterSessionService;
  } {
    const userRepository = new PrismaUserRepository(prisma);
    const passwordHasher = new BcryptPasswordHasher();
    const passwordValidator = new ZodPasswordValidator();

    const authService = new BaseAuthenticationService(userRepository, passwordHasher, passwordValidator);
    const sessionManager = new ReactRouterSessionService(storage, userRepository);

    return {
      authService,
      sessionManager,
    };
  }
}
