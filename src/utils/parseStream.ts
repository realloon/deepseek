import type { StreamEvent } from '../types'

const terminalEvents = new Set<StreamEvent['type']>([
  'response.completed',
  'response.incomplete',
  'response.failed',
])

export default async function* parseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<StreamEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let eventName = ''
  let data = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })

      while (true) {
        const newline = buffer.indexOf('\n')
        if (newline === -1) break

        const line = buffer.slice(0, newline).replace(/\r$/, '')
        buffer = buffer.slice(newline + 1)

        if (line === '') {
          if (!data) continue

          const event = JSON.parse(data) as StreamEvent
          if (eventName && event.type !== eventName) {
            throw new Error(
              `DeepSeek stream event mismatch: ${eventName} != ${event.type}`,
            )
          }

          yield event
          eventName = ''
          data = ''

          if (terminalEvents.has(event.type)) return
          continue
        }

        if (line.startsWith('event:')) {
          eventName = line.slice(6).trimStart()
          continue
        }

        if (line.startsWith('data:')) {
          data += `${data ? '\n' : ''}${line.slice(5).trimStart()}`
          continue
        }

        throw new Error(`Invalid DeepSeek stream line: ${line}`)
      }

      if (done) break
    }
  } finally {
    await reader.cancel()
    reader.releaseLock()
  }

  throw new Error('DeepSeek stream ended before a terminal response event')
}
