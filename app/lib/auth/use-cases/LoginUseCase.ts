import { z } from 'zod';
import { IncorrectPasswordError, UserNotFoundError } from '../errors';
import type { AuthService } from '../services/AuthService';
import type { SessionService } from '../services/SessionService';

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface LoginOutput {
  success: boolean;
  error?: string;
  redirectResponse?: Response;
}

export class LoginUseCase {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const parseResult = loginSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0].message };
    }
    const { email, password } = parseResult.data;

    try {
      const user = await this.authService.login(email, password);
      const response = await this.sessionService.create(user.id, '/');
      return { success: true, redirectResponse: response };
    } catch (error) {
      if (error instanceof UserNotFoundError || error instanceof IncorrectPasswordError) {
        return { success: false, error: 'Invalid email or password' };
      }
      throw error;
    }
  }
}
