import { EnvSchema } from "./env.schema.ts"

declare module "@rio.js/env" {
  export interface RioEnv extends EnvSchema {}
}

declare global {
  interface ImportMeta {
    env: EnvSchema & { BUILD_VERSION: string }
  }
}
