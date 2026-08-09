import type { RequestBody, Response, Usage } from './types.js'
import { request } from './request.js'

export type GenerateTextResult = {
  text: string
  reasoning: string | null
  usage: Usage | null
  response: Response
}

export type StreamTextChunk =
  | { type: 'text-delta'; delta: string }
  | { type: 'reasoning-delta'; delta: string }
  | { type: 'finish'; response: Response }

export function getOutputText(response: Response): string {
  return response.output
    .filter(item => item.type === 'message')
    .flatMap(item => item.content)
    .map(part => part.text)
    .join('')
}

export function getReasoningText(response: Response): string | null {
  const reasoning = response.output
    .filter(item => item.type === 'reasoning')
    .flatMap(item => item.content)
    .map(part => part.text)
    .join('')

  return reasoning || null
}

function assertTextResponse(response: Response) {
  if (response.status === 'failed') {
    const detail = response.error
      ? ` (${response.error.code}): ${response.error.message}`
      : ''
    throw new Error(`DeepSeek response failed${detail}`)
  }

  if (response.status === 'incomplete') {
    const detail = response.incomplete_details?.reason
      ? `: ${response.incomplete_details.reason}`
      : ''
    throw new Error(`DeepSeek response incomplete${detail}`)
  }

  if (response.status !== 'completed') {
    throw new Error(`Unexpected DeepSeek response status: ${response.status}`)
  }

  if (!response.output.some(item => item.type === 'message')) {
    throw new Error('DeepSeek returned no text output')
  }
}

export async function generateText(
  requestBody: RequestBody,
): Promise<GenerateTextResult> {
  const response = await request(requestBody)
  assertTextResponse(response)

  return {
    text: getOutputText(response),
    reasoning: getReasoningText(response),
    usage: response.usage,
    response,
  }
}

export async function* streamText(
  requestBody: RequestBody,
): AsyncGenerator<StreamTextChunk> {
  const events = await request({ ...requestBody, stream: true })

  for await (const event of events) {
    if (event.type === 'response.output_text.delta') {
      yield { type: 'text-delta', delta: event.delta }
      continue
    }

    if (event.type === 'response.reasoning_text.delta') {
      yield { type: 'reasoning-delta', delta: event.delta }
      continue
    }

    if (event.type === 'response.completed') {
      assertTextResponse(event.response)
      yield { type: 'finish', response: event.response }
      continue
    }

    if (
      event.type === 'response.incomplete' ||
      event.type === 'response.failed'
    ) {
      assertTextResponse(event.response)
    }
  }
}
