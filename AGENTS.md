# Agent Notes for `my-gpt-next`

- Purpose: Next.js App Router project that provides a local ChatGPT-style UI called “MyGPT”, chatting with models served by Ollama running on the same machine (`http://localhost:11434`).
- How it works: `app/page.jsx` holds the client UI—conversation list, message bubbles with Markdown/code highlighting, model dropdown, theme toggle, and localStorage persistence for chats/model/theme. `Sidebar.jsx`, `MessageBubble.jsx`, and `ModelSelector.jsx` live in `app/components/`.
- Backend: `app/api/chat/route.js` proxies POST requests to Ollama’s `/api/chat` with the selected model and conversation history, then streams assistant tokens back to the client. Default model fallback is `qwen2.5:3b`; UI list includes several LLaMA/Qwen/Mistral model IDs.
- Running locally: `npm install` then `npm run dev`; ensure Ollama is installed, `ollama serve` is running, and requested models are pulled (e.g., `ollama pull qwen2.5:3b`).
- State/storage: Conversations, chosen model, and theme persist via localStorage keys `mygpt-conversations`, `mygpt-model`, and `mygpt-theme`.
- Styling/layout: Global styles in `app/globals.css`; root layout in `app/layout.jsx`. Uses client-side rendering with streaming updates for the assistant message.
