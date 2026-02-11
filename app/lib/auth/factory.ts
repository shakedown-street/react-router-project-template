import type { PrismaClient } from 'prisma/generated/client';
import { storage } from './config';
import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { AuthenticationService } from './services/AuthenticationService';
import { PasswordService } from './services/PasswordService';
import { SessionManager } from './session/SessionManager';
import { PasswordValidator } from './validators/PasswordValidator';

export class AuthServiceFactory {
  static create(prisma: PrismaClient): {
    authService: AuthenticationService;
    sessionManager: SessionManager;
  } {
    const userRepository = new PrismaUserRepository(prisma);
    const passwordService = new PasswordService();
    const passwordValidator = new PasswordValidator();

    const authService = new AuthenticationService(userRepository, passwordService, passwordValidator);
    const sessionManager = new SessionManager(storage, userRepository);

    return {
      authService,
      sessionManager,
    };
  }
}
