const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const DEFAULT_KEYCLOAK_URL = 'http://localhost:8081';
const DEFAULT_KEYCLOAK_REALM = 'client-portal';
const DEFAULT_KEYCLOAK_CLIENT_ID = 'client-portal-web';
const DEFAULT_BUSINESS_ID = '11111111-1111-1111-1111-111111111111';

function boolFromEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

export const appConfig = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, ''),
  keycloakUrl: import.meta.env.VITE_KEYCLOAK_URL || DEFAULT_KEYCLOAK_URL,
  keycloakRealm: import.meta.env.VITE_KEYCLOAK_REALM || DEFAULT_KEYCLOAK_REALM,
  keycloakClientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || DEFAULT_KEYCLOAK_CLIENT_ID,
  portalBusinessId: import.meta.env.VITE_PORTAL_BUSINESS_ID || DEFAULT_BUSINESS_ID,
  enableSilentSso: boolFromEnv(import.meta.env.VITE_ENABLE_SILENT_SSO, false),
  mockAuth: boolFromEnv(import.meta.env.VITE_MOCK_AUTH, false),
};
