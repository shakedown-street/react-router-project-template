import { createCookieSessionStorage } from 'react-router';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const storage = createCookieSessionStorage({
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
