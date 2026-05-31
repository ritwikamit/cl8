export type ThemeMode = 'dark' | 'light' | 'auto';

export type TerminalType = 'windows-terminal' | 'powershell' | 'cmd' | 'linux' | 'macos' | 'unknown';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  dim: string;
  border: string;
}

export interface UIState {
  reducedMotion: boolean;
  highContrast: boolean;
  noSplash: boolean;
  themeMode: ThemeMode;
}
