import Aura from '@primeuix/themes/aura';

export const towerOpsTheme = {
  ...Aura,
  cssVariables: {
    light: {
      'primary-color': 'var(--to-primary)',
      'primary-50': '#eff6ff',
      'primary-100': '#dbeafe',
      'primary-200': '#bfdbfe',
      'primary-300': '#93c5fd',
      'primary-400': '#60a5fa',
      'primary-500': '#0052ff',
      'primary-600': '#0077ff',
      'primary-700': '#0047dc',
      'primary-800': '#1e40af',
      'primary-900': '#1e3a8a',

      'surface-0': '#ffffff',
      'surface-50': '#f8fafc',
      'surface-100': '#f1f5f9',
      'surface-200': '#e2e8f0',
      'surface-300': '#cbd5e1',
      'surface-400': '#94a3b8',
      'surface-500': '#64748b',
      'surface-600': '#475569',
      'surface-700': '#334155',
      'surface-800': '#1e293b',
      'surface-900': '#0f172a',

      'text-color': '#0f172a',
      'text-color-secondary': '#64748b',

      'border-color': '#e2e8f0',
      'surface-border': '#e2e8f0',

      'success-color': '#10b981',
      'info-color': '#00b2ff',
      'warn-color': '#f59e0b',
      'error-color': '#ef4444',

      'mask-surface': 'rgba(15, 23, 42, 0.35)',
    } as Record<string, string>,
  },
};