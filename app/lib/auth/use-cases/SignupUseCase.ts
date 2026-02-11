import { z } from 'zod';
import { EmailAlreadyExistsError, InvalidPasswordError } from '../errors';
import type { IAuthenticationService } from '../services/IAuthenticationService';
import type { ISessionManager } from '../session/ISessionManager';

const signupSchema = z.object({
  email: z.email(),
  password: z.string(),
  confirmPassword: z.string(),
});

export type SignupInput = z.infer<typeof signupSchema>;

export interface SignupOutput {
  success: boolean;
  error?: string;
  redirectResponse?: Response;
}

export class SignupUseCase {
  constructor(
    private authService: IAuthenticationService,
    private sessionManager: ISessionManager,
  ) {}

  async execute(input: SignupInput): Promise<SignupOutput> {
    const parseResult = signupSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }
    const { email, password, confirmPassword } = parseResult.data;

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    try {
      const user = await this.authService.signup(email, password);
      const response = await this.sessionManager.create(user.id, '/');
      return { success: true, redirectResponse: response };
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError || error instanceof InvalidPasswordError) {
        return { success: false, error: error.message };
      }
      throw error;
    }
  }
}
