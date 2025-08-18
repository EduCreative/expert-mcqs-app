import type { PaletteMode } from '@mui/material'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildTheme } from '../theme'

type FontSize = 'sm' | 'md' | 'lg' | 'xl'

interface UIContextValue {
  mode: PaletteMode
  setMode: (m: PaletteMode) => void
  fontSize: FontSize
  setFontSize: (f: FontSize) => void
  showAnswers: boolean
  setShowAnswers: (show: boolean) => void
  lastSyncedAt?: number
  setLastSyncedAt: (t: number) => void
}

const UIContext = createContext<UIContextValue | undefined>(undefined)

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return {
    ...ctx,
    // toggleAnswers: () => ctx.setShowAnswers(!ctx.showAnswers)
  }
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>((localStorage.getItem('mode') as PaletteMode) || 'light')
  const [fontSize, setFontSize] = useState<FontSize>((localStorage.getItem('fontSize') as FontSize) || 'md')
  const [lastSyncedAt, setLastSyncedAt] = useState<number | undefined>(undefined)
  const [showAnswers, setShowAnswers] = useState<boolean>(() => {
    const saved = localStorage.getItem('showAnswers')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('mode', mode)
  }, [mode])

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('showAnswers', JSON.stringify(showAnswers))
  }, [showAnswers])

  const theme = useMemo(() => buildTheme(mode, fontSize), [mode, fontSize])

  const value = useMemo(
    () => ({ mode, setMode, fontSize, setFontSize, showAnswers, setShowAnswers, lastSyncedAt, setLastSyncedAt }),
    [mode, fontSize, showAnswers, lastSyncedAt],
  )

  return (
    <UIContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </UIContext.Provider>
  )
}


