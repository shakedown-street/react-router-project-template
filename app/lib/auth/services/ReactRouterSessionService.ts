import { redirect, type Session, type SessionStorage } from 'react-router';
import type { UserRepository } from '../repositories/UserRepository';
import type { User } from '../types/User';
import type { SessionService } from './SessionService';

const USER_ID_STORAGE_KEY = 'userId';
const COOKIE_HEADER = 'Cookie';

export class ReactRouterSessionService implements SessionService {
  constructor(
    private storage: SessionStorage,
    private userRepository: UserRepository,
  ) {}

  async create(userId: string, redirectTo: string): Promise<Response> {
    const session = await this.storage.getSession();
    session.set(USER_ID_STORAGE_KEY, userId);
    return redirect(redirectTo, { headers: { 'Set-Cookie': await this.storage.commitSession(session) } });
  }

  async destroy(request: Request, redirectTo: string): Promise<Response> {
    const session = await this.get(request);
    return redirect(redirectTo, { headers: { 'Set-Cookie': await this.storage.destroySession(session) } });
  }

  async getUser(request: Request): Promise<User | null> {
    const userId = await this.getUserId(request);
    if (userId === null) {
      return null;
    }
    return await this.userRepository.findById(userId);
  }

  async getUserId(request: Request): Promise<string | null> {
    const session = await this.get(request);
    const userId = session.get(USER_ID_STORAGE_KEY);
    if (!userId || typeof userId !== 'string') {
      return null;
    }
    return userId;
  }

  async requireUser(request: Request): Promise<User> {
    const user = await this.getUser(request);
    if (user === null) {
      throw redirect('/auth/login');
    }
    return user;
  }

  private async get(request: Request): Promise<Session> {
    return await this.storage.getSession(this.getCookieHeader(request));
  }

  private getCookieHeader(request: Request): string | null {
    return request.headers.get(COOKIE_HEADER);
  }
}
