'use client'

export default function ModelSelector({ model, models, onChange }) {
  return (
    <select
      value={model}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '6px 12px',
        color: 'var(--text-primary)',
        fontSize: '12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        outline: 'none',
        transition: 'border-color 0.15s',
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
