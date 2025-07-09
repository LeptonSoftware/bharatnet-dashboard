import { createApp, loadEnv } from "@rio.js/vinxi"

import { envSchema } from "./env.schema"

loadEnv(envSchema, import.meta.url)
export default createApp()
