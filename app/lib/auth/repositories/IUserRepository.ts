import type { IUser, IUserWithPassword } from '../types/IUser';

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailWithPassword(email: string): Promise<IUserWithPassword | null>;
  create(email: string, passwordHash: string): Promise<IUser>;
  update(id: string, data: Partial<IUser>): Promise<IUser>;
  delete(id: string): Promise<void>;
}
