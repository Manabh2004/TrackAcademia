export const colors = {
  page: '#020617',
  pageAlt: '#0f172a',
  panel: '#111c34',
  panelSoft: '#16233d',
  panelMuted: '#0b1222',
  border: '#24324d',
  borderStrong: '#334155',
  text: '#e2e8f0',
  textSoft: '#94a3b8',
  textMuted: '#64748b',
  primary: '#3b82f6',
  primaryStrong: '#2563eb',
  success: '#22c55e',
  successSoft: '#052e1b',
  warning: '#f59e0b',
  warningSoft: '#3b2a08',
  danger: '#ef4444',
  dangerSoft: '#3a1014',
};

export const layout = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${colors.pageAlt} 0%, ${colors.page} 100%)`,
    color: colors.text,
  },
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${colors.pageAlt} 0%, ${colors.page} 100%)`,
    color: colors.text,
  },
  sidebar: {
    width: 240,
    background: 'rgba(2, 6, 23, 0.92)',
    color: colors.text,
    padding: 24,
    flexShrink: 0,
    borderRight: `1px solid ${colors.border}`,
    boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.02)',
  },
  main: {
    flex: 1,
    padding: 32,
    background: 'transparent',
    color: colors.text,
  },
};

export const surface = {
  card: {
    background: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 16,
    padding: 24,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 18px 50px rgba(0,0,0,0.22)',
    color: colors.text,
  },
  mutedCard: {
    background: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 14,
    padding: 18,
    border: `1px solid ${colors.border}`,
    color: colors.text,
  },
};

export const form = {
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.textSoft,
    marginBottom: 6,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 10,
    border: `1px solid ${colors.borderStrong}`,
    background: colors.panelMuted,
    color: colors.text,
    fontSize: 14,
    boxSizing: 'border-box',
  },
};

export const buttons = {
  primary: {
    padding: '10px 20px',
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryStrong} 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
  },
  secondary: {
    padding: '10px 18px',
    background: colors.panelSoft,
    color: colors.text,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  success: {
    padding: '8px 16px',
    background: colors.success,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
  },
  danger: {
    padding: '8px 16px',
    background: colors.danger,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
  },
  warning: {
    padding: '8px 16px',
    background: colors.warning,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
  },
};

export const table = {
  head: {
    textAlign: 'left',
    padding: '12px 14px',
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textSoft,
    background: 'rgba(30, 41, 59, 0.65)',
    fontSize: 13,
    fontWeight: 700,
  },
  cell: {
    padding: '12px 14px',
    borderBottom: `1px solid rgba(36, 50, 77, 0.7)`,
    color: colors.text,
    fontSize: 14,
  },
};
