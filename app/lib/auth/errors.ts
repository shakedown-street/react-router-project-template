export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super('User not found');
  }
}

export class IncorrectPasswordError extends AuthError {
  constructor() {
    super('Incorrect password');
  }
}

export class InvalidPasswordError extends AuthError {
  constructor(message?: string) {
    super(message ?? 'Invalid password');
  }
}

export class EmailAlreadyExistsError extends AuthError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
