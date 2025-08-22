import { useState } from 'react'
import { Box, Drawer, List, ListItemButton, ListItemText, Divider, Container } from '@mui/material'
import TopBar from '../components/TopBar'

export default function Shell({ leftItems, children }: { leftItems: { label: string; href: string; icon?: React.ReactNode}[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', width: '100%' }}>
      <TopBar onToggleLeftMenu={() => setOpen(true)} onOpenTopMenu={() => {}} />
      <Drawer open={open} onClose={() => setOpen(false)} variant="temporary">
        <Box sx={{ width: 280 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            {leftItems.map((i) => (
              <ListItemButton key={i.href} component="a" href={i.href}>
                {i.icon && <Box sx={{ minWidth: 32, display: 'flex', alignItems: 'center', mr: 1 }}>{i.icon}</Box>}
                <ListItemText primary={i.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
      <Container component="main" sx={{ flex: 1, py: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Box sx={{ flex: 1 }}>{children}</Box>
        <Box sx={{ mt: 4, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'space-between', borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <a href="#/">Home</a>
            <a href="#/about">About Us</a>
            <a href="#/contact">Contact Us</a>
            <a href="#/submit">Submit MCQs</a>
          </Box>
          <Box>© {new Date().getFullYear()} Expert MCQs</Box>
        </Box>
      </Container>
    </Box>
  )
}


