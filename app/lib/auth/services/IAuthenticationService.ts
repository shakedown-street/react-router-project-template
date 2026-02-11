import type { IUser } from '../types/IUser';

export interface IAuthenticationService {
  login(email: string, password: string): Promise<IUser>;
  signup(email: string, password: string): Promise<IUser>;
  checkEmailExists(email: string): Promise<boolean>;
}
