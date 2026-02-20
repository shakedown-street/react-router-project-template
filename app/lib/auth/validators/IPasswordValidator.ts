export type PasswordValidationResult = {
  valid: boolean;
  error?: string;
};

export interface IPasswordValidator {
  validate(password: string): PasswordValidationResult;
}
