export async function POST(request) {
  const { message, history = [], model = 'qwen2.5:3b' } = await request.json()

  const messages = [
    ...history,
    { role: 'user', content: message }
  ]

  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true })
    })

    if (!ollamaResponse.ok) {
      return new Response('Ollama error', { status: 500 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(Boolean)

          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              if (data.message?.content) {
                controller.enqueue(new TextEncoder().encode(data.message.content))
              }
            } catch {}
          }
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to connect to Ollama. Make sure it is running.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
