import { revai } from "@ai-sdk/revai"
import { experimental_transcribe as transcribe } from "ai"
import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file.js"
import { HTTPEvent, toWebRequest } from "vinxi/http"

process.env.REVAI_API_KEY =
  "023sdsU1YEjpOXSyauHAUD2fNXrjtvRNqxGOXZqYSZc31ZPJvJJq09EUAkms8F3UVUmKnNkmDbqLpT6mX0GLCBNvDHlcw"

global.Blob = Blob
global.File = File

export async function POST(event: HTTPEvent) {
  try {
    let req = toWebRequest(event)
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new Response("File not provided", { status: 400 })
    }

    // const transcription = await openai.audio.transcriptions.create({
    //   file,
    //   model: "whisper-1",
    // })

    const result = await transcribe({
      model: revai.transcription("machine"),
      audio: await file.arrayBuffer(),
      providerOptions: { revai: { language: "en" } },
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
