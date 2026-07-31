import { request } from './src/deepseek'

const response = await request({
  model: 'deepseek-v4-flash',
  input: 'hello',
})
