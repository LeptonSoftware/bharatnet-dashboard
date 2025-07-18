import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime"
import { HTTPEvent, toWebRequest } from "vinxi/http"

import { env } from "@rio.js/env"

process.env.GOOGLE_API_KEY = env.PRIVATE_GOOGLE_API_KEY
const serviceAdapter = new GoogleGenerativeAIAdapter({
  model: "gemini-2.5-flash-preview-04-17",
})

const runtime = new CopilotRuntime({
  remoteEndpoints: [],
})

export function POST(event: HTTPEvent) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  })

  return handleRequest(toWebRequest(event))
}
