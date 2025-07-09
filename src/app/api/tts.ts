import { hume } from "@ai-sdk/hume"
import { experimental_generateSpeech as generateSpeech } from "ai"
import { HTTPEvent, toWebRequest } from "vinxi/http"

process.env.HUME_API_KEY = "AHvpv7XcVbZlyhOpMqK6wCfYr6PW3MY5IG4n3rD3VdLaqVHv"

export async function GET(event: HTTPEvent) {
  const req = toWebRequest(event)
  const url = new URL(req.url)
  const text = url.searchParams.get("text") // 'text' is the query parameter name

  if (!text) {
    return new Response("Text parameter is missing", { status: 400 })
  }
  const result = await generateSpeech({
    model: hume.speech(),
    text: text,
    voice: "d8ab67c6-953d-4bd8-9370-8fa53a0f1453",
    providerOptions: { hume: {} },
  })

  return new Response(result.audio.uint8Array, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  })
}
