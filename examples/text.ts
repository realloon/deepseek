import { generateText, streamText } from '../index'

// const { text, reasoning } = await generateText({
//   input: 'rimsage 是什么？',
//   tools: [
//     {
//       type: 'web_search',
//     },
//   ],
// })

// console.log(`<thinking>\n${reasoning}\n</thinking>\n`)
// console.log(text)

const stream = streamText({
  input: 'rimsage 是什么？',
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
