export type Model = 'deepseek-v4-flash'

type ItemStatus = 'in_progress' | 'completed' | 'incomplete'

export type Message = {
  type?: 'message'
  role: 'system' | 'developer' | 'assistant' | 'user'
  content: string
}

export type FunctionCall = {
  type: 'function_call'
  call_id: string
  name: string
  arguments: string
}

export type FunctionCallOutput = {
  type: 'function_call_output'
  call_id: string
  output: string
}

export type ReasoningItem = {
  type: 'reasoning'
  content: Array<{ type: 'reasoning_text'; text: string }>
}

export type WebSearchCall = {
  type: 'web_search_call'
  id: string
  status: 'in_progress' | 'searching' | 'completed' | 'failed'
}

type OutputText = {
  type: 'output_text'
  text: string
  annotations: Array<Record<string, unknown>>
}

export type OutputItem =
  | {
      id: string
      type: 'message'
      status: ItemStatus
      role: 'assistant'
      content: OutputText[]
    }
  | (ReasoningItem & { id: string })
  | (FunctionCall & { id: string; status: ItemStatus })
  | {
      id: string
      type: 'custom_tool_call'
      call_id: string
      name: 'apply_patch'
      input: string
      status: ItemStatus
    }
  | WebSearchCall

export type Input =
  | string
  | Array<
      | Message
      | FunctionCall
      | FunctionCallOutput
      | ReasoningItem
      | WebSearchCall
      | OutputItem
    >

export type FunctionTool = {
  type: 'function'
  name: string
  description?: string
  parameters: Record<string, unknown>
  strict?: boolean
}

export type Tool =
  | FunctionTool
  | { type: 'web_search' | 'web_search_2025_08_26' }

export type ToolChoice =
  | 'none'
  | 'auto'
  | 'required'
  | { type: 'function'; name: string }
  | { type: 'web_search' | 'web_search_2025_08_26' }

type TextFormat =
  | { type: 'text' }
  | { type: 'json_object' }
  | {
      type: 'json_schema'
      name: string
      description?: string
      schema: Record<string, unknown>
      strict?: boolean
    }

type RequestOptions = {
  model: Model
  reasoning?: { effort: 'high' | 'max' }
  max_output_tokens?: number
  temperature?: number
  top_p?: number
  top_logprobs?: number
  text?: { format: TextFormat }
  tools?: Tool[]
  tool_choice?: ToolChoice
  user?: string
}

type BaseRequest = RequestOptions &
  (
    | { input: Input; instructions?: string }
    | { input?: Input; instructions: string }
  )

export type Request = BaseRequest & { stream?: false }

export type StreamRequest = BaseRequest & { stream: true }

export type Usage = {
  input_tokens: number
  input_tokens_details: { cached_tokens: number }
  output_tokens: number
  output_tokens_details: { reasoning_tokens: number }
  total_tokens: number
}

export type Response = {
  id: string
  object: 'response'
  created_at: number
  status: 'in_progress' | 'completed' | 'incomplete' | 'failed'
  model: Model
  output: OutputItem[]
  usage: Usage | null
  error: { code: string; message: string } | null
  incomplete_details: { reason: string } | null
}

type StreamEventBase = { sequence_number: number }

export type StreamEvent = StreamEventBase &
  (
    | {
        type:
          | 'response.created'
          | 'response.in_progress'
          | 'response.completed'
          | 'response.incomplete'
          | 'response.failed'
        response: Response
      }
    | {
        type: 'response.output_item.added' | 'response.output_item.done'
        output_index: number
        item: OutputItem
      }
    | {
        type: 'response.content_part.added' | 'response.content_part.done'
        item_id: string
        output_index: number
        content_index: number
        part: OutputText | { type: 'reasoning_text'; text: string }
      }
    | {
        type: 'response.output_text.delta' | 'response.reasoning_text.delta'
        item_id: string
        output_index: number
        content_index: number
        delta: string
      }
    | {
        type: 'response.output_text.done' | 'response.reasoning_text.done'
        item_id: string
        output_index: number
        content_index: number
        text: string
      }
    | {
        type: 'response.function_call_arguments.delta'
        item_id: string
        output_index: number
        delta: string
      }
    | {
        type: 'response.function_call_arguments.done'
        item_id: string
        output_index: number
        arguments: string
      }
    | {
        type: 'response.custom_tool_call_input.delta'
        item_id: string
        output_index: number
        delta: string
      }
    | {
        type: 'response.custom_tool_call_input.done'
        item_id: string
        output_index: number
        input: string
      }
    | {
        type:
          | 'response.web_search_call.in_progress'
          | 'response.web_search_call.searching'
          | 'response.web_search_call.completed'
        item_id: string
        output_index: number
      }
  )
