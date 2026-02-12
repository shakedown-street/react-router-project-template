import type { User } from '../types/User';

export interface AuthenticationService {
  login(email: string, password: string): Promise<User>;
  signup(email: string, password: string): Promise<User>;
  checkEmailExists(email: string): Promise<boolean>;
}
