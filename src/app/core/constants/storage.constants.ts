export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'to_access_token',
  REFRESH_TOKEN: 'to_refresh_token',
  USER: 'to_user',
  SIDEBAR_COLLAPSED: 'to_sidebar_collapsed',
  THEME: 'to_theme',
  FACILITY: 'to_facility',
} as const;

export type StorageKey =
  (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];