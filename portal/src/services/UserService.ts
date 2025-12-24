import { User } from '../types/domain';
import { HttpClient } from './httpClient';

export interface UserService {
  getCurrentUser(): Promise<User>;
  updateCurrentUser(user: Partial<User>): Promise<User>;
}

export class ApiUserService implements UserService {
  constructor(private readonly client: HttpClient) {}

  getCurrentUser(): Promise<User> {
    return this.client.get<User>('/api/users/me');
  }

  updateCurrentUser(user: Partial<User>): Promise<User> {
    return this.client.put<User>('/api/users/me', user);
  }
}
