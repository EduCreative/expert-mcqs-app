import Shell from '../layout/Shell'
import { Stack, TextField, Button, Typography } from '@mui/material'

export default function Contact() {
  const leftItems = [
    { label: 'Home', href: '#/' },
    { label: 'Practice', href: '#/practice' },
    { label: 'Quiz', href: '#/quiz' },
    { label: 'Favorites', href: '#/favorites' },
  ]
  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>Contact Us</Typography>
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <TextField label="Your email" fullWidth />
        <TextField label="Message" fullWidth multiline minRows={3} />
        <Button variant="contained">Send</Button>
      </Stack>
    </Shell>
  )
}


