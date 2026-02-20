import { describe, expect, it } from 'vitest';
import { ZodPasswordValidator } from './ZodPasswordValidator';

describe('ZodPasswordValidator', () => {
  const validator = new ZodPasswordValidator();

  it('accepts a valid password (8+ chars, upper, lower, number, special)', () => {
    expect(validator.validate('ValidPass1!')).toEqual({ valid: true });
    expect(validator.validate('Another99@')).toEqual({ valid: true });
  });

  it('rejects password shorter than 8 characters', () => {
    const result = validator.validate('Short1!');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters');
  });

  it('rejects password without uppercase', () => {
    const result = validator.validate('alllowercase1!');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must contain at least one uppercase letter');
  });

  it('rejects password without lowercase', () => {
    const result = validator.validate('ALLUPPERCASE1!');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must contain at least one lowercase letter');
  });

  it('rejects password without a number', () => {
    const result = validator.validate('NoNumbers!');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must contain at least one number');
  });

  it('rejects password without a special character', () => {
    const result = validator.validate('NoSpecial1');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must contain at least one special character');
  });

  it('rejects empty string', () => {
    const result = validator.validate('');
    expect(result.valid).toBe(false);
  });
});
