import { generateText } from '../index'

const { text } = await generateText({
  input: [
    {
      role: 'user',
      content: 'ping',
    },
  ],
})

console.log(text)
