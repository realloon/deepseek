import type { Request, Response, StreamEvent, StreamRequest } from './types.js'
import parseStream from './parseStream.js'

const endpoint = 'https://api.deepseek.com/responses'
const defaultModel = 'deepseek-v4-flash'

export function request(request: Request): Promise<Response>

export function request(
  request: StreamRequest,
): Promise<AsyncIterable<StreamEvent>>

export async function request(
  request: Request | StreamRequest,
): Promise<Response | AsyncIterable<StreamEvent>> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set')

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: request.stream ? 'text/event-stream' : 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      ...request,
      model: request.model ?? defaultModel,
    }),
  })

  if (!response.ok) {
    throw new Error(
      `DeepSeek request failed (${response.status}): ${await response.text()}`,
    )
  }

  if (request.stream) {
    if (!response.body) throw new Error('DeepSeek returned an empty stream')
    return parseStream(response.body)
  }

  return (await response.json()) as Response
}
