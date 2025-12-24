import { AuthService } from './AuthService';
import { LoginInput, SignupInput, UserSession } from '../types/domain';

export class MockAuthService implements AuthService {
  private readonly defaultSession: UserSession = {
    token: 'mock-token',
    user: {
      id: 'mock-admin-id',
      email: 'admin@example.com',
      firstName: 'Mock',
      lastName: 'Admin',
      role: 'ADMIN',
    },
    business: {
      id: 'mock-business-id',
      name: 'Mock Business',
      primaryContactUserId: 'mock-admin-id',
      createdAt: new Date().toISOString(),
    },
  };

  private session: UserSession | null = this.defaultSession;

  constructor() {
    console.log('MockAuthService initialized');
  }

  async signup(input?: SignupInput): Promise<void> {
    console.log('Mock signup', input);
    this.session = this.defaultSession;
  }

  async login(input?: LoginInput): Promise<void> {
    console.log('Mock login', input);
    this.session = this.defaultSession;
  }

  async logout(): Promise<void> {
    console.log('Mock logout');
    this.session = null;
  }

  async getSession(): Promise<UserSession | null> {
    return this.session;
  }

  async getAccessToken(): Promise<string | null> {
    return this.session?.token ?? null;
  }
}
