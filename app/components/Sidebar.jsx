'use client'

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, isOpen }) {
  return (
    <aside
      className="sidebar"
      style={{
        width: isOpen ? '260px' : '0',
        minWidth: isOpen ? '260px' : '0',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-outfit)',
          fontWeight: 800,
          fontSize: '20px',
          color: 'var(--accent)',
          marginBottom: '20px',
          letterSpacing: '-0.5px',
          whiteSpace: 'nowrap'
        }}>
          ✦ MyGPT
        </div>

        {/* New Chat */}
        <button
          onClick={onNew}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            textAlign: 'left',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-dm-sans)',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> New Chat
        </button>

        {/* Section label */}
        <div style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-faint)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '8px',
          whiteSpace: 'nowrap'
        }}>
          Recent
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              className="conv-item"
              onClick={() => onSelect(conv.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '8px',
                background: activeId === conv.id ? 'var(--bg-tertiary)' : 'transparent',
                border: activeId === conv.id ? '1px solid var(--border)' : '1px solid transparent',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '12px', flexShrink: 0 }}>💬</span>
              <span style={{
                flex: 1,
                fontSize: '13px',
                color: activeId === conv.id ? 'var(--text-primary)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'var(--font-dm-sans)',
              }}>
                {conv.title || 'New Chat'}
              </span>
              <button
                className="conv-delete"
                onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  opacity: 0,
                  flexShrink: 0,
                  transition: 'opacity 0.15s',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-faint)',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
        }}>
          Powered by Groq
        </div>

      </div>
    </aside>
  )
}
