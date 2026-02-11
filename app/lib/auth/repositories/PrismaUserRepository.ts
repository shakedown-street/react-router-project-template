import type { PrismaClient } from 'prisma/generated/client';
import type { IUser, IUserWithPassword } from '../types/IUser';
import type { IUserRepository } from './IUserRepository';

export const userSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  email: true,
  isSuperuser: true,
};

export const userWithPasswordSelect = {
  ...userSelect,
  password: true,
};

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  }

  async findByEmailWithPassword(email: string): Promise<IUserWithPassword | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: userWithPasswordSelect,
    });
  }

  async create(email: string, passwordHash: string): Promise<IUser> {
    return this.prisma.user.create({
      data: { email, password: passwordHash },
      select: userSelect,
    });
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
