export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class UserNotFoundError extends AuthenticationError {
  constructor() {
    super('User not found');
  }
}

export class IncorrectPasswordError extends AuthenticationError {
  constructor() {
    super('Incorrect password');
  }
}

export class InvalidPasswordError extends AuthenticationError {
  constructor(message?: string) {
    super(message ?? 'Invalid password');
  }
}

export class EmailAlreadyExistsError extends AuthenticationError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
