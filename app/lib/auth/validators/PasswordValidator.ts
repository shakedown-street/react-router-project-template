import z from 'zod';
import type { IPasswordValidator } from './IPasswordValidator';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export class PasswordValidator implements IPasswordValidator {
  validate(password: string): { valid: boolean; error?: string } {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      return { valid: false, error: result.error.issues[0].message };
    }
    return { valid: true };
  }
}
