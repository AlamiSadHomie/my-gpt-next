'use client'

export default function ModelSelector({ model, models, onChange, compact = false }) {
  return (
    <select
      value={model}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: compact ? '10px' : '8px',
        padding: compact ? '8px 10px' : '6px 12px',
        color: 'var(--text-primary)',
        fontSize: compact ? '12px' : '12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        outline: 'none',
        transition: 'border-color 0.15s',
        minWidth: compact ? '120px' : 'auto',
      }}
    >
      {models.map(m => (
        <option key={m.id} value={m.id} style={{ background: 'var(--bg-secondary)' }}>
          {m.name}
        </option>
      ))}
    </select>
  )
}
