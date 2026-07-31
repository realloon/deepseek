import type { Request, Response, StreamEvent, StreamRequest } from './types'
import parseStream from './utils/parseStream'

const endpoint = 'https://api.deepseek.com/responses'

export function request(request: StreamRequest): Promise<AsyncIterable<StreamEvent>>

export function request(request: Request): Promise<Response>

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
    body: JSON.stringify(request),
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

export function getOutputText(response: Response): string {
  return response.output
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content)
    .filter((part) => part.type === 'output_text')
    .map((part) => part.text)
    .join('')
}
