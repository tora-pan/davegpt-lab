import { useRef, useState, type FormEvent } from 'react'
import './App.css'

type Role = 'user' | 'assistant'

interface Message {
  role: Role
  content: string
}

type StreamEvent =
  | { type: 'start'; conversationId: string }
  | { type: 'token'; content: string }
  | { type: 'usage'; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }
  | { type: 'done' }
  | { type: 'error'; error: string }

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const conversationId = useRef<string | undefined>(undefined)

  function appendToLastAssistantMessage(update: (content: string) => string) {
    setMessages((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (last?.role === 'assistant') {
        next[next.length - 1] = { ...last, content: update(last.content) }
      }
      return next
    })
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setIsStreaming(true)

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId: conversationId.current }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''

        for (const line of events) {
          if (!line.startsWith('data: ')) continue
          const event = JSON.parse(line.slice(6)) as StreamEvent

          if (event.type === 'start') {
            conversationId.current = event.conversationId
          } else if (event.type === 'token') {
            appendToLastAssistantMessage((content) => content + event.content)
          } else if (event.type === 'error') {
            appendToLastAssistantMessage(() => `Error: ${event.error}`)
          }
        }
      }
    } catch {
      appendToLastAssistantMessage(() => 'Something went wrong reaching the server.')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="chat">
      <header className="chat-header">
        <h1>DaveGPT</h1>
        <p>Your financial assistant</p>
      </header>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">Ask about your balance, spending, or subscriptions.</p>
        )}
        {messages.map((message, i) => (
          <div key={i} className={`chat-bubble ${message.role}`}>
            {message.content || (isStreaming && i === messages.length - 1 ? '…' : '')}
          </div>
        ))}
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}

export default App
