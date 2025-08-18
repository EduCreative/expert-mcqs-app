import Shell from '../layout/Shell'
import { Typography } from '@mui/material'

export default function About() {
  const leftItems = [
    { label: 'Home', href: '#/' },
    { label: 'Practice', href: '#/practice' },
    { label: 'Quiz', href: '#/quiz' },
    { label: 'Favorites', href: '#/favorites' },
  ]
  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>About Us</Typography>
      <Typography variant="body2">Expert MCQs helps you practice and quiz across categories, online and offline.</Typography>
    </Shell>
  )
}


