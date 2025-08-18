import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'

export type ColorMode = 'light' | 'dark'

export function buildTheme(mode: ColorMode, fontSize: 'sm' | 'md' | 'lg' | 'xl') {
  const base = 14
  const scale = fontSize === 'sm' ? 0.9 : fontSize === 'md' ? 1 : fontSize === 'lg' ? 1.1 : 1.2

  const options: ThemeOptions = {
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#0ea5e9' : '#60a5fa' },
      secondary: { main: '#6366f1' },
      background: {
        default: mode === 'light' ? '#f6f9fc' : '#0b1020',
        paper: mode === 'light' ? '#ffffff' : '#0f152a',
      },
    },
    typography: {
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      fontSize: Math.round(base * scale),
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiAppBar: { styleOverrides: { root: { backdropFilter: 'saturate(180%) blur(12px)' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    },
  }

  return createTheme(options)
}


