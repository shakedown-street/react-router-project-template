import type { User } from '../types/User';

export interface ISessionService<TSession> {
  get(request: Request): Promise<TSession>;
  create(userId: string, redirectTo: string): Promise<Response>;
  destroy(request: Request, redirectTo: string): Promise<Response>;
  getUser(request: Request): Promise<User | null>;
  getUserId(request: Request): Promise<string | null>;
  requireUser(request: Request): Promise<User>;
}
