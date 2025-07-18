import {
  type Simplify,
  type ToEnvSchema,
  type ToEnvVariables,
  createEnvSchema,
  z,
} from "@rio.js/env/utils"

const SUPABASE_URL = "https://hzgytqitccsaffrvvdff.supabase.co/"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3l0cWl0Y2NzYWZmcnZ2ZGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5ODc4MDYsImV4cCI6MjA1NTU2MzgwNn0.L26B3duhlES6yEPLJ2ZmeSdpmkfjsBbTxAdbtz9UhEg"

// Base CSP values that should always be present
const getBaseCSP = (publicRioEngineUrl = SUPABASE_URL) =>
  ({
    CONNECT_SRC: `'self' data: ${publicRioEngineUrl} ${process.env.NODE_ENV !== "production" ? "*" : ""} wss://${new URL(SUPABASE_URL).hostname}/realtime/v1/websocket https://*.ingest.de.sentry.io https://*.leptonmaps.com https://api.mapbox.com https://maps.googleapis.com https://mapsresources-pa.googleapis.com https://www.gstatic.com https://*.googleapis.com https://events.mapbox.com https://challenges.cloudflare.com https://iconify-markers.deno.dev https://*.rio.software https://*.iconify.design/`,
    SCRIPT_SRC:
      "'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://api.mapbox.com https://maps.googleapis.com",
    FRAME_SRC: "'self' https://challenges.cloudflare.com",
    IMG_SRC: `'self' data: ${publicRioEngineUrl} https://*.openstreetmap.org https://iconify-markers.deno.dev https://maps.gstatic.com https://maps.googleapis.com https://*.googleapis.com https://*.googleusercontent.com https://*.githubusercontent.com`,
    STYLE_SRC: "'self' 'unsafe-inline' https://fonts.googleapis.com",
    FONT_SRC: "'self' data: https://fonts.gstatic.com",
    FRAME_ANCESTORS: "'self' https://*.qlikcloud.com",
  }) as const

const settingsSchema = z.object({
  PUBLIC: z.object({
    APP: z.object({
      NAME: z.string().default("BharatNet"),
    }),
    COMPANY: z.object({
      NAME: z.string().default("Lepton Software"),
    }),
    SUPABASE: z.object({
      URL: z.string().default(SUPABASE_URL),
      ANON_KEY: z.string().default(SUPABASE_ANON_KEY),
      AUTH: z.object({
        URL: z.string().default(`${SUPABASE_URL}auth/v1`),
        ANON_KEY: z.string().default(SUPABASE_ANON_KEY),
      }),
    }),
  }),
  PRIVATE: z.object({
    // Base CSP settings with all default values
    CSP_BASE_CONNECT_SRC: z.string().default(getBaseCSP().CONNECT_SRC),
    CSP_BASE_SCRIPT_SRC: z.string().default(getBaseCSP().SCRIPT_SRC),
    CSP_BASE_FRAME_SRC: z.string().default(getBaseCSP().FRAME_SRC),
    CSP_BASE_IMG_SRC: z.string().default(getBaseCSP().IMG_SRC),
    CSP_BASE_STYLE_SRC: z.string().default(getBaseCSP().STYLE_SRC),
    CSP_BASE_FONT_SRC: z.string().default(getBaseCSP().FONT_SRC),
    CSP_BASE_FRAME_ANCESTORS: z.string().default(getBaseCSP().FRAME_ANCESTORS),

    // Overrideable CSP settings (empty by default)
    CSP_CONNECT_SRC: z.string().default(""),
    CSP_SCRIPT_SRC: z.string().default(""),
    CSP_FRAME_SRC: z.string().default(""),
    CSP_IMG_SRC: z.string().default(""),
    CSP_STYLE_SRC: z.string().default(""),
    CSP_FONT_SRC: z.string().default(""),
    CSP_FRAME_ANCESTORS: z.string().default(""),
    SUPABASE: z.object({
      URL: z.string().default(SUPABASE_URL),
      ANON_KEY: z.string().default(SUPABASE_ANON_KEY),
      SERVICE_ROLE_KEY: z
        .string()
        .default(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3l0cWl0Y2NzYWZmcnZ2ZGZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk4NzgwNiwiZXhwIjoyMDU1NTYzODA2fQ.sM7pcgzgljN9dB-25taj6fLROBGZRjNbH374A3liHqM",
        ),
      AUTH: z.object({
        URL: z.string().default(`${SUPABASE_URL}auth/v1`),
        ANON_KEY: z.string().default(SUPABASE_ANON_KEY),
      }),
    }),
    COPILOTKIT: z.object({
      URL: z.string().default("http://127.0.0.1:8000/copilotkit"),
    }),
    GOOGLE_API_KEY: z
      .string()
      .default("AIzaSyCN5moMjI6jHNwOO77SjA4YAHY7onVrTK0"),
  }),
})

export type EnvVariables = Simplify<
  ToEnvVariables<z.infer<typeof settingsSchema>>
>
export type EnvSchema = ToEnvSchema<EnvVariables>
export const envSchema = createEnvSchema<EnvSchema>(settingsSchema)
