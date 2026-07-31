# @realloon/deepseek

A lightweight DeepSeek client built on the official Responses API.

## Installation

```sh
npm install @realloon/deepseek
```

## Usage

```ts
import { generateText } from '@realloon/deepseek'

const { text } = await generateText({
  input: 'Hello',
})

console.log(text)
```
