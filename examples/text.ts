import { streamText } from '../index'

const stream = streamText({
  input: 'what is rimsage?',
  tools: [
    {
      type: 'web_search',
    },
  ],
})

for await (const chunk of stream) {
  if (chunk.type === 'reasoning-delta') {
    process.stdout.write(chunk.delta)
  }

  if (chunk.type === 'text-delta') {
    process.stdout.write(chunk.delta)
  }

  if (chunk.type === 'finish') {
    process.stdout.write('\n')
  }
}
