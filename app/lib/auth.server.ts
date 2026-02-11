import bcrypt from 'bcrypt';
import { z } from 'zod';
import type { User } from '~/types/user.types';
import { createUser as createUserDb, getUserByEmail, getUserWithPasswordByEmail } from '~/db/user.db.server';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createUser(email: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password);
  return createUserDb(email, hashedPassword);
}

export async function verifyLogin(email: string, password: string): Promise<User | null> {
  const user = await getUserWithPasswordByEmail(email);
  if (!user) {
    return null;
  }
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return null;
  }
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return { valid: false, error: result.error.issues[0].message };
  }
  return { valid: true };
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user !== null;
}
