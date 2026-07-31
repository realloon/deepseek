import { generateText } from '../index'

const text = await generateText({
  model: 'deepseek-v4-flash',
  input: 'hello',
})

console.log(text)
