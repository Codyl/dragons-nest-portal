export {};

interface Env {
  readonly COGNITO_USER_POOL_ID: string;
  readonly COGNITO_CLIENT_ID: string;
  readonly COGNITO_CLIENT_SECRET: string;
  readonly COGNITO_USER_POOL_REGION: string;
  readonly COGNITO_USER_POOL_CLIENT_ID: string;
  readonly COGNITO_USER_POOL_CLIENT_SECRET: string;
}

/** Vite client env (import.meta.env) - used by frontend. */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_COGNITO_USER_POOL_ID?: string;
  readonly VITE_COGNITO_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
