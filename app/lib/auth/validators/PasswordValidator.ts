export type PasswordValidationResult = {
  valid: boolean;
  error?: string;
};

export interface PasswordValidator {
  validate(password: string): PasswordValidationResult;
}
