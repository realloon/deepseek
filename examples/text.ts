import { generateText } from '../index'

const text = await generateText({
  model: 'deepseek-v4-flash',
  input: 'ping',
})

console.log(text)
