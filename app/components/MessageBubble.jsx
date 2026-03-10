'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function MessageBubble({ message, isStreaming, isMobile = false }) {
  const isUser = message.role === 'user'
  const bubbleMaxWidth = isMobile ? '92%' : '78%'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      padding: isMobile ? '4px 14px' : '6px 24px',
      width: '100%',
      maxWidth: isMobile ? '100%' : '860px',
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>

      {/* AI avatar */}
      {!isUser && (
        <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, var(--accent), var(--accent-cyan))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        marginRight: isMobile ? '8px' : '10px',
        flexShrink: 0,
        marginTop: '4px',
      }}>
        ✦
      </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: bubbleMaxWidth,
        padding: isMobile ? '12px 13px' : '12px 16px',
        borderRadius: isUser ? '16px 16px 6px 16px' : '6px 16px 16px 16px',
        background: isUser ? 'var(--accent)' : 'var(--bg-secondary)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: isUser ? '#fff' : 'var(--text-primary)',
        fontSize: '14px',
        lineHeight: '1.65',
        fontFamily: 'var(--font-dm-sans)',
        wordBreak: 'break-word',
      }}>

        {isUser ? (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
        ) : (
          <div className={isStreaming ? 'streaming-cursor' : ''}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        borderRadius: '8px',
                        fontSize: '13px',
                        margin: '10px 0',
                        border: '1px solid var(--border)',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                p:          ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                ul:         ({ children }) => <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>{children}</ul>,
                ol:         ({ children }) => <ol style={{ paddingLeft: '20px', margin: '6px 0' }}>{children}</ol>,
                li:         ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
                h1:         ({ children }) => <h1 style={{ fontSize: '18px', fontWeight: 700, margin: '12px 0 6px', fontFamily: 'var(--font-outfit)' }}>{children}</h1>,
                h2:         ({ children }) => <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '10px 0 4px', fontFamily: 'var(--font-outfit)' }}>{children}</h2>,
                h3:         ({ children }) => <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '8px 0 4px' }}>{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderLeft: '3px solid var(--accent)',
                    paddingLeft: '12px',
                    margin: '8px 0',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}>
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content || (isStreaming ? '\u00A0' : '')}
            </ReactMarkdown>
          </div>
        )}
      </div>

    </div>
  )
}
