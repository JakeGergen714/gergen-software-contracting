/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_KEYCLOAK_URL?: string;
	readonly VITE_KEYCLOAK_REALM?: string;
	readonly VITE_KEYCLOAK_CLIENT_ID?: string;
	readonly VITE_PORTAL_BUSINESS_ID?: string;
	readonly VITE_ENABLE_SILENT_SSO?: string;
	readonly VITE_MOCK_AUTH?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
