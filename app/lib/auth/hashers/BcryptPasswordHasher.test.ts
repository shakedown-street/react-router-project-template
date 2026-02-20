import { describe, expect, it } from 'vitest';
import { BcryptPasswordHasher } from './BcryptPasswordHasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('hashes a password and returns a non-empty string', async () => {
    const hash = await hasher.hash('myPassword123');
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).not.toBe('myPassword123');
  });

  it('verify returns true for correct password', async () => {
    const password = 'ValidPass1!';
    const hash = await hasher.hash(password);
    const isValid = await hasher.verify(password, hash);
    expect(isValid).toBe(true);
  });

  it('verify returns false for wrong password', async () => {
    const hash = await hasher.hash('correctPassword');
    const isValid = await hasher.verify('wrongPassword', hash);
    expect(isValid).toBe(false);
  });

  it('produces different hashes for the same password (salt)', async () => {
    const hash1 = await hasher.hash('samePassword');
    const hash2 = await hasher.hash('samePassword');
    expect(hash1).not.toBe(hash2);
    expect(await hasher.verify('samePassword', hash1)).toBe(true);
    expect(await hasher.verify('samePassword', hash2)).toBe(true);
  });
});
