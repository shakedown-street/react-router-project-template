import type { PrismaClient } from 'prisma/generated/client';
import { PrismaUserDAO } from './daos/PrismaUserDAO';
import { BcryptPasswordHasher } from './hashers/BcryptPasswordHasher';
import { AuthService } from './services/AuthService';
import { SessionService } from './services/SessionService';
import { ZodPasswordValidator } from './validators/ZodPasswordValidator';

export function getAuthService(prisma: PrismaClient) {
  const userDao = new PrismaUserDAO(prisma);
  const passwordHasher = new BcryptPasswordHasher();
  const passwordValidator = new ZodPasswordValidator();

  return new AuthService(userDao, passwordHasher, passwordValidator);
}

export function getSessionService(prisma: PrismaClient) {
  const userDao = new PrismaUserDAO(prisma);

  return new SessionService(userDao);
}
