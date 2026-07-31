import { generateText } from '../index'

const { text } = await generateText({
  input: 'hello',
})

console.log(text)
