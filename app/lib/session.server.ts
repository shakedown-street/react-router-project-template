import { createCookieSessionStorage, redirect, type Session, type SessionData } from 'react-router';
import 'dotenv/config';
import { getUser } from '~/db/user.db.server';
import type { User } from '~/types/user.types';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const USER_ID_STORAGE_KEY = 'userId';

const storage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE,
  },
});

export async function getSession(request: Request): Promise<Session<SessionData, SessionData>> {
  return await storage.getSession(request.headers.get('Cookie'));
}

export async function commitSession(userId: string): Promise<string> {
  const session = await storage.getSession();
  session.set(USER_ID_STORAGE_KEY, userId);
  return await storage.commitSession(session);
}

export async function destroySession(request: Request): Promise<string> {
  const session = await getSession(request);
  return await storage.destroySession(session);
}

export async function getSessionUserId(request: Request): Promise<string | null> {
  const session = await getSession(request);
  const userId = session.get(USER_ID_STORAGE_KEY);
  if (!userId || typeof userId !== 'string') {
    return null;
  }
  return userId;
}

export async function getSessionUser(request: Request): Promise<User | null> {
  const userId = await getSessionUserId(request);
  if (!userId) {
    return null;
  }
  try {
    return getUser(userId);
  } catch (error) {
    return null;
  }
}

export async function requireSessionUserId(request: Request): Promise<string> {
  const userId = await getSessionUserId(request);
  if (!userId) {
    throw redirect(`/auth/login`);
  }
  return userId;
}

export async function requireSessionUser(request: Request): Promise<User> {
  const user = await getSessionUser(request);
  if (!user) {
    throw redirect(`/auth/login`);
  }
  return user;
}
