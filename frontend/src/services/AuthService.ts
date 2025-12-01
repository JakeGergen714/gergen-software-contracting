import Keycloak, {
  KeycloakConfig,
  KeycloakInitOptions,
  KeycloakTokenParsed,
} from 'keycloak-js';
import {
  Business,
  BusinessOverview,
  LoginInput,
  SignupInput,
  User,
  UserSession,
} from '../types/domain';
import { appConfig } from '../config';

export interface AuthService {
  signup(input?: SignupInput): Promise<void>;
  login(input?: LoginInput): Promise<void>;
  logout(): Promise<void>;
  getSession(): Promise<UserSession | null>;
  getAccessToken(): Promise<string | null>;
}

interface KeycloakAuthConfig {
  apiBaseUrl: string;
  businessId: string;
  keycloak: KeycloakConfig;
  enableSilentSso?: boolean;
}

function mapUser(token: KeycloakTokenParsed | undefined): User {
  const roles: string[] =
    (token?.realm_access && Array.isArray(token.realm_access.roles)
      ? token.realm_access.roles
      : []) ?? [];
  const role: User['role'] = roles.includes('ADMIN')
    ? 'ADMIN'
    : roles.includes('CLIENT_OWNER')
      ? 'CLIENT_OWNER'
      : 'CLIENT_MEMBER';

  return {
    id: token?.sub || 'unknown-user',
    email: token?.email || token?.preferred_username || 'unknown@unknown.local',
    firstName: token?.given_name || 'Portal',
    lastName: token?.family_name || 'User',
    role,
  };
}

export class KeycloakAuthService implements AuthService {
  private readonly keycloak: Keycloak;
  private readonly apiBaseUrl: string;
  private readonly businessId: string;
  private silentSsoActive: boolean;
  private initPromise: Promise<boolean> | null = null;
  private session: UserSession | null = null;

  constructor(config: KeycloakAuthConfig = {
    apiBaseUrl: appConfig.apiBaseUrl,
    businessId: appConfig.portalBusinessId,
    keycloak: {
      url: appConfig.keycloakUrl,
      realm: appConfig.keycloakRealm,
      clientId: appConfig.keycloakClientId,
    },
    enableSilentSso: appConfig.enableSilentSso,
  }) {
    this.keycloak = new Keycloak(config.keycloak);
    try {
      this.keycloak.clearToken();
    } catch (err) {
      console.warn('Unable to clear stale Keycloak tokens', err);
    }
    this.apiBaseUrl = config.apiBaseUrl;
    this.businessId = config.businessId;
    const automationDetected = this.isAutomationContext();
    const runtimeOptOut = this.hasRuntimeSilentSsoOptOut();
    this.silentSsoActive =
      (config.enableSilentSso ?? true) && !automationDetected && !runtimeOptOut;
    console.info('Keycloak silent SSO status', {
      enabledInConfig: config.enableSilentSso ?? true,
      automationDetected,
      runtimeOptOut,
      effective: this.silentSsoActive,
    });
    if (automationDetected) {
      console.info('Silent SSO disabled for automated browser context');
    } else if (runtimeOptOut) {
      console.info('Silent SSO disabled via runtime opt-out flag');
    }
    this.keycloak.onTokenExpired = () => {
      this.keycloak
        .updateToken(30)
        .then(() => {
          if (this.session && this.keycloak.token) {
            this.session = { ...this.session, token: this.keycloak.token };
          }
        })
        .catch(() => {
          this.session = null;
        });
    };
  }

  async signup(_input?: SignupInput): Promise<void> {
    await this.ensureInit();
    try {
      await this.keycloak.register();
    } catch (err) {
      console.error('Keycloak signup failed', err);
      throw err instanceof Error
        ? err
        : new Error('Unable to register with Keycloak');
    }
  }

  async login(input?: LoginInput): Promise<void> {
    await this.ensureInit();
    try {
      await this.keycloak.login({ loginHint: input?.email });
    } catch (err) {
      console.error('Keycloak login failed', err);
      throw err instanceof Error
        ? err
        : new Error('Unable to start Keycloak login');
    }
  }

  async logout(): Promise<void> {
    this.session = null;
    await this.ensureInit();
    try {
      await this.keycloak.logout({ redirectUri: window.location.origin });
    } catch (err) {
      console.error('Keycloak logout failed', err);
      throw err instanceof Error
        ? err
        : new Error('Unable to log out of Keycloak');
    }
  }

  async getSession(): Promise<UserSession | null> {
    await this.ensureInit();
    if (!this.keycloak.authenticated) {
      this.session = null;
      return null;
    }

    const token = await this.getAccessToken();
    if (!token) {
      this.session = null;
      return null;
    }

    if (this.session) {
      return this.session;
    }

    const business = await this.fetchBusiness(token);
    const user = mapUser(this.keycloak.tokenParsed);
    this.session = { token, user, business };
    return this.session;
  }

  async getAccessToken(): Promise<string | null> {
    await this.ensureInit();
    if (!this.keycloak.authenticated) {
      return null;
    }
    try {
      await this.keycloak.updateToken(30);
    } catch (err) {
      console.error('Unable to refresh Keycloak token', err);
      return null;
    }
    return this.keycloak.token || null;
  }

  private async ensureInit(): Promise<boolean> {
    if (!this.initPromise) {
      this.initPromise = this.initKeycloak().catch((err) => {
        this.initPromise = null;
        throw err;
      });
    }
    return this.initPromise;
  }

  private async fetchBusiness(token: string): Promise<Business> {
    const response = await fetch(
      `${this.apiBaseUrl}/api/businesses/${this.businessId}/overview`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Business overview request failed', response.status, response.statusText);
      throw new Error('Unable to load business overview');
    }

    const body = (await response.json()) as BusinessOverview;
    return body.business;
  }

  private buildInitOptions(): KeycloakInitOptions {
    const baseOptions: KeycloakInitOptions = {
      useNonce: false,
      pkceMethod: 'S256',
      checkLoginIframe: false,
      enableLogging: true,
    };

    if (!this.silentSsoActive) {
      return baseOptions;
    }

    return {
      ...baseOptions,
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    };
  }

  private isSilentSsoFrameError(err: unknown): boolean {
    if (!err) {
      return false;
    }

    const message = err instanceof Error ? err.message : String(err);
    const isDomException =
      typeof DOMException !== 'undefined' && err instanceof DOMException;
    const securityError = isDomException && err.name === 'SecurityError';
    return securityError || /cross-origin frame/i.test(message);
  }

  private async initKeycloak(): Promise<boolean> {
    try {
      const result = await this.keycloak.init(this.buildInitOptions());
      if (!result && this.silentSsoActive) {
        console.info('Silent SSO returned no session; continuing without auto re-init');
      }
      return result;
    } catch (err) {
      if (this.silentSsoActive && this.isSilentSsoFrameError(err)) {
        console.warn(
          'Keycloak silent SSO failed; retrying without silent mode',
          err
        );
        this.silentSsoActive = false;
        return this.keycloak.init(this.buildInitOptions());
      }
      console.error('Keycloak initialization failed', err);
      throw err instanceof Error
        ? err
        : new Error('Unable to initialize Keycloak');
    }
  }

  private isAutomationContext(): boolean {
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      return true;
    }
    if (typeof window !== 'undefined') {
      const automationFlags = ['Cypress', '__PLAYWRIGHT__', 'MS_PLAYWRIGHT', '__pwEnv'];
      return automationFlags.some((flag) => flag in window);
    }
    return false;
  }

  private hasRuntimeSilentSsoOptOut(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const win = window as typeof window & {
      __E2E_DISABLE_SILENT_SSO?: boolean;
    };
    if (win.__E2E_DISABLE_SILENT_SSO) {
      return true;
    }
    try {
      return window.localStorage?.getItem('portal:disableSilentSso') === 'true';
    } catch (err) {
      return false;
    }
  }
}
