import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  const { message, history = [], model = 'llama-3.1-8b-instant' } = await request.json()

  const messages = [
    ...history,
    { role: 'user', content: message }
  ]

  try {
    const stream = await groq.chat.completions.create({
      model,
      messages,
      stream: true,
      max_tokens: 1024,
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(new TextEncoder().encode(content))
          }
        }
        controller.close()
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Groq API error: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}