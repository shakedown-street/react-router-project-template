import { prisma } from '~/lib/prisma';
import { type User, userSelect, type UserWithPassword, userWithPasswordSelect } from '~/types/user.types';

export async function getUser(id: string): Promise<User> {
  return prisma.user.findUniqueOrThrow({
    where: { id },
    select: userSelect,
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
    select: userSelect,
  });
}

export async function getUserWithPasswordByEmail(email: string): Promise<UserWithPassword | null> {
  return prisma.user.findUnique({
    where: { email },
    select: userWithPasswordSelect,
  });
}

export async function createUser(email: string, password: string): Promise<User> {
  return prisma.user.create({
    data: {
      email,
      password,
    },
    select: userSelect,
  });
}
