export const COOKIE_HEADER = 'Cookie';

export const SESSION_SECRET = process.env.SESSION_SECRET!;
export const SESSION_COOKIE_NAME = '__session';
export const SESSION_SECURE = process.env.NODE_ENV === 'production';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
export const SESSION_USER_ID_KEY = 'userId';
