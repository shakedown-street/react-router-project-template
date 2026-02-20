import { createCookieSessionStorage, redirect, type Session } from 'react-router';
import {
  COOKIE_HEADER,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  SESSION_SECRET,
  SESSION_SECURE,
  SESSION_USER_ID_KEY,
} from '../config';
import type { IUserDAO } from '../daos/IUserDAO';
import type { User } from '../types/User';
import type { ISessionService } from './ISessionService';

export const storage = createCookieSessionStorage({
  cookie: {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [SESSION_SECRET],
    secure: SESSION_SECURE,
    maxAge: SESSION_MAX_AGE,
  },
});

export class SessionService implements ISessionService<Session> {
  constructor(private userDao: IUserDAO) {}

  async get(request: Request): Promise<Session> {
    return await storage.getSession(this.getCookieHeader(request));
  }

  async create(userId: string, redirectTo: string): Promise<Response> {
    const session = await storage.getSession();
    session.set(SESSION_USER_ID_KEY, userId);
    return redirect(redirectTo, { headers: { 'Set-Cookie': await storage.commitSession(session) } });
  }

  async destroy(request: Request, redirectTo: string): Promise<Response> {
    const session = await this.get(request);
    return redirect(redirectTo, { headers: { 'Set-Cookie': await storage.destroySession(session) } });
  }

  async getUser(request: Request): Promise<User | null> {
    const userId = await this.getUserId(request);
    if (userId === null) {
      return null;
    }
    return await this.userDao.findById(userId);
  }

  async getUserId(request: Request): Promise<string | null> {
    const session = await this.get(request);
    const userId = session.get(SESSION_USER_ID_KEY);
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

  private getCookieHeader(request: Request): string | null {
    return request.headers.get(COOKIE_HEADER);
  }
}
