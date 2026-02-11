import type { IUser } from '../types/IUser';

export interface ISessionManager {
  create(userId: string, redirectTo: string): Promise<Response>;
  destroy(request: Request, redirectTo: string): Promise<Response>;
  getUser(request: Request): Promise<IUser | null>;
  getUserId(request: Request): Promise<string | null>;
  requireUser(request: Request): Promise<IUser>;
}
