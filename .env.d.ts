export {};

interface Env {
  readonly COGNITO_USER_POOL_ID: string;
  readonly COGNITO_CLIENT_ID: string;
  readonly COGNITO_CLIENT_SECRET: string;
  readonly COGNITO_USER_POOL_REGION: string;
  readonly COGNITO_USER_POOL_CLIENT_ID: string;
  readonly COGNITO_USER_POOL_CLIENT_SECRET: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
