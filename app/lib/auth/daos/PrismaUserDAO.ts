import { prisma } from '~/lib/prisma';
import { UserNotFoundError } from '../errors';
import type { User } from '../types/User';
import type { IUserDAO } from './IUserDAO';

export const userSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  email: true,
  isSuperuser: true,
};

export class PrismaUserDAO implements IUserDAO {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  }

  async create(email: string, passwordHash: string): Promise<User> {
    return prisma.user.create({
      data: { email, password: passwordHash },
      select: userSelect,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async getPasswordHash(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    return user.password;
  }
}
