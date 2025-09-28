export const DEV_BYPASS_AUTH =
  process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true';

const rawTarget = (process.env.EXPO_PUBLIC_DEV_BYPASS_TARGET || 'parent').toLowerCase();

export const DEV_BYPASS_TARGET: 'ParentTabs' | 'SitterTabs' =
  rawTarget === 'sitter' ? 'SitterTabs' : 'ParentTabs';

