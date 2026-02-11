import type { IUser } from '../types/IUser';

export interface ISessionManager {
  create(userId: string): Promise<string>;
  destroy(request: Request): Promise<string>;
  getUser(request: Request): Promise<IUser | null>;
  getUserId(request: Request): Promise<string | null>;
  requireUser(request: Request): Promise<IUser>;
}
