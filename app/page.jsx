'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import MessageBubble from './components/MessageBubble'
import ModelSelector from './components/ModelSelector'

const MODELS = [
  { id: 'llama-3.1-8b-instant',    name: 'LLaMA 3.1 · 8B (Fast)'  },
  { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 · 70B (Smart)' },
]

function newConversation() {
  return {
    id: Date.now().toString(),
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
  }
}

export default function Home() {
  const initialMobile = typeof window !== 'undefined' ? window.innerWidth < 900 : true

  const [conversations, setConversations] = useState([])
  const [activeId,      setActiveId]      = useState(null)
  const [input,         setInput]         = useState('')
  const [isStreaming,   setIsStreaming]    = useState(false)
  const [model,         setModel]         = useState('llama-3.1-8b-instant')
  const [isDark,        setIsDark]        = useState(true)
  const [sidebarOpen,   setSidebarOpen]   = useState(!initialMobile)
  const [isMobile,      setIsMobile]      = useState(initialMobile)

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const textareaRef    = useRef(null)

  // ── Load from localStorage on mount ──
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900
      setIsMobile(mobile)
      setSidebarOpen(mobile ? false : true)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const saved = localStorage.getItem('mygpt-conversations')
    if (saved) {
      const convs = JSON.parse(saved)
      if (convs.length > 0) {
        setConversations(convs)
        setActiveId(convs[0].id)
        return
      }
    }
    const initial = newConversation()
    setConversations([initial])
    setActiveId(initial.id)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const savedModel = localStorage.getItem('mygpt-model')
    if (savedModel) setModel(savedModel)

    const savedTheme = localStorage.getItem('mygpt-theme')
    const dark = savedTheme !== 'light'
    setIsDark(dark)
    document.documentElement.className = dark ? 'dark' : 'light'
  }, [])

  // ── Persist to localStorage ──
  useEffect(() => {
    if (conversations.length > 0)
      localStorage.setItem('mygpt-conversations', JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    localStorage.setItem('mygpt-model', model)
  }, [model])

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : 'light'
    localStorage.setItem('mygpt-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, activeId])

  // ── Auto-resize textarea ──
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const activeConversation = conversations.find(c => c.id === activeId)

  const updateConversation = (id, updater) =>
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c))

  // ── Send message ──
  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return

    const userContent = input.trim()
    setInput('')
    setIsStreaming(true)

    const targetId   = activeId
    const userMsg    = { role: 'user',      content: userContent }
    const assistMsg  = { role: 'assistant', content: '' }

    // Append user message + empty assistant placeholder
    updateConversation(targetId, conv => ({
      ...conv,
      title:    conv.messages.length === 0 ? userContent.slice(0, 42) : conv.title,
      messages: [...conv.messages, userMsg, assistMsg],
    }))

    try {
      const history = (activeConversation?.messages || [])
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: userContent, history, model }),
      })

      if (!res.ok) throw new Error('Server error')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value)

        // Update the last (assistant) message live
        setConversations(prev => prev.map(c => {
          if (c.id !== targetId) return c
          const msgs = [...c.messages]
          msgs[msgs.length - 1] = { role: 'assistant', content: full }
          return { ...c, messages: msgs }
        }))
      }

    } catch {
      setConversations(prev => prev.map(c => {
        if (c.id !== targetId) return c
        const msgs = [...c.messages]
        msgs[msgs.length - 1] = {
          role: 'assistant',
          content: '❌ Could not connect to Groq. Check your API key on Vercel.',
        }
        return { ...c, messages: msgs }
      }))
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  const handleNewConversation = () => {
    const conv = newConversation()
    setConversations(prev => [conv, ...prev])
    setActiveId(conv.id)
  }

  const handleDeleteConversation = (id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id)
      if (filtered.length === 0) {
        const fresh = newConversation()
        setActiveId(fresh.id)
        return [fresh]
      }
      if (activeId === id) setActiveId(filtered[0].id)
      return filtered
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>

      {/* ── Sidebar ── */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Backdrop to close drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(2px)',
            zIndex: 5,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* ── Main area ── */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header style={{
          padding:        '10px 20px',
          paddingTop:     'calc(10px + env(safe-area-inset-top, 0px))',
          borderBottom:   '1px solid var(--border)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          background:     'var(--bg-secondary)',
          gap:            '12px',
          flexShrink:     0,
          position:       'sticky',
          top:            0,
          zIndex:         2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                fontSize: '18px', padding: '4px 6px', borderRadius: '6px',
              }}
              title="Toggle sidebar"
            >
              ☰
            </button>
            <span style={{
              fontFamily: 'var(--font-outfit)',
              fontWeight: 700, fontSize: '16px',
              color: 'var(--accent)',
            }}>
              MyGPT
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ModelSelector model={model} models={MODELS} onChange={setModel} />
            <button
              onClick={() => setIsDark(d => !d)}
              style={{
                background:   'var(--bg-tertiary)',
                border:       '1px solid var(--border)',
                borderRadius: '8px',
                padding:      '5px 10px',
                color:        'var(--text-muted)',
                cursor:       'pointer',
                fontSize:     '14px',
              }}
              title="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>

          {/* Empty state */}
          {(!activeConversation || activeConversation.messages.length === 0) && (
            <div style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              height:         '100%',
              gap:            '12px',
              color:          'var(--text-muted)',
              padding:        '40px',
              textAlign:      'center',
            }}>
              <div style={{ fontSize: '42px' }}>✦</div>
              <div style={{
                fontFamily: 'var(--font-outfit)',
                fontSize:   '22px',
                fontWeight: 600,
                color:      'var(--text-primary)',
              }}>
                How can I help you today?
              </div>
              <div style={{ fontSize: '13px' }}>
                Running{' '}
                <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {model}
                </span>{' '}
                via Groq
              </div>

              {/* Starter prompts */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
                {[
                  'Explain quantum computing simply',
                  'Write a Python function to sort a list',
                  'Apa itu kecerdasan buatan?',
                  'Give me 5 productivity tips',
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); inputRef.current?.focus() }}
                    style={{
                      background:   'var(--bg-secondary)',
                      border:       '1px solid var(--border)',
                      borderRadius: '10px',
                      padding:      '8px 14px',
                      color:        'var(--text-muted)',
                      fontSize:     '12px',
                      cursor:       'pointer',
                      fontFamily:   'var(--font-dm-sans)',
                      transition:   'all 0.15s',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {activeConversation?.messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              isStreaming={
                isStreaming &&
                i === activeConversation.messages.length - 1 &&
                msg.role === 'assistant'
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding:    '14px 24px',
          borderTop:  '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
        }}>
          <div style={{
            display:      'flex',
            gap:          '10px',
            background:   'var(--bg-tertiary)',
            border:       '1px solid var(--border)',
            borderRadius: '14px',
            padding:      '10px 14px',
            maxWidth:     '800px',
            margin:       '0 auto',
            alignItems:   'flex-end',
          }}>
            <textarea
              ref={el => { inputRef.current = el; textareaRef.current = el }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message MyGPT… (Enter to send, Shift+Enter for new line)"
              disabled={isStreaming}
              rows={1}
              style={{
                flex:        1,
                background:  'none',
                border:      'none',
                outline:     'none',
                color:       'var(--text-primary)',
                fontFamily:  'var(--font-dm-sans)',
                fontSize:    '14px',
                resize:      'none',
                lineHeight:  '1.55',
                maxHeight:   '200px',
                overflowY:   'auto',
              }}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={isStreaming || !input.trim()}
              style={{
                background:   input.trim() && !isStreaming ? 'var(--accent)' : 'var(--bg-primary)',
                border:       '1px solid var(--border)',
                borderRadius: '8px',
                padding:      '6px 18px',
                color:        input.trim() && !isStreaming ? '#fff' : 'var(--text-faint)',
                cursor:       input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                fontSize:     '13px',
                fontFamily:   'var(--font-dm-sans)',
                fontWeight:   600,
                whiteSpace:   'nowrap',
                transition:   'all 0.2s',
                flexShrink:   0,
              }}
            >
              {isStreaming ? '···' : 'Send ↑'}
            </button>
          </div>
          <p style={{
            textAlign:  'center',
            fontSize:   '11px',
            color:      'var(--text-faint)',
            marginTop:  '8px',
            fontFamily: 'var(--font-mono)',
          }}>
            MyGPT may make mistakes — verify important information.
          </p>
        </div>

      </div>
    </div>
  )
}
