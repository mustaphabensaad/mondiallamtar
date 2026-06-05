import { useThemeStore } from '../store/theme.store';

export function useTheme() {
  const { theme, toggle } = useThemeStore();
  return { theme, toggle, isDark: theme === 'dark' };
}
