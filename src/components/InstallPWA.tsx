import { useEffect, useState } from 'react'
import { Button } from '@mui/material'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const installedHandler = () => setIsInstalled(true)
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  // Show the button only if not installed, and enable only if installable
  if (isInstalled) return null;
  return (
    <Button
      color="secondary"
      variant="contained"
      disabled={!deferredPrompt}
      onClick={async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') setDeferredPrompt(null)
      }}
      sx={{ ml: 1 }}
      title={
        !deferredPrompt
          ? 'Install is only available in supported browsers, in production (https), and if not already installed.'
          : ''
      }
    >
      Install App
    </Button>
  )
}


