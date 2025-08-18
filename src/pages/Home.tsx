import { Box, Card, CardActionArea, CardContent, Typography, Button } from '@mui/material'
import QuizIcon from '@mui/icons-material/Quiz'
import SchoolIcon from '@mui/icons-material/School'
import ShareIcon from '@mui/icons-material/Share'
import { useAuth } from '../providers/AuthProvider'
import Shell from '../layout/Shell'

export default function Home() {
  const { user } = useAuth()
  const lastSeen = (() => {
    try {
      const raw = localStorage.getItem('lastSeenPractice')
      if (!raw) return null
      const obj = JSON.parse(raw)
      if (!obj?.cat || !obj?.i) return null
      return `#/practice?cat=${encodeURIComponent(obj.cat)}&i=${encodeURIComponent(obj.i)}`
    } catch {
      return null
    }
  })()
  const leftItems = [
    { label: 'Home', href: '#/' },
    { label: 'Practice', href: '#/practice' },
    { label: 'Quiz', href: '#/quiz' },
    { label: 'Favorites', href: '#/favorites' },
    { label: 'Submit MCQs', href: '#/submit' },
    { label: 'About Us', href: '#/about' },
    { label: 'Contact Us', href: '#/contact' },
  ]

  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>Welcome {user ? user.displayName ?? 'Learner' : 'Guest'}!</Typography>
      <Box sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
      }}>
        <Card>
          <CardActionArea href="#/practice">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchoolIcon color="primary" />
                <Box>
                  <Typography variant="h6">MCQs Practice</Typography>
                  <Typography variant="body2">View answers with explanations</Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card>
          <CardActionArea href="#/quiz">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <QuizIcon color="secondary" />
                <Box>
                  <Typography variant="h6">MCQs Quiz</Typography>
                  <Typography variant="body2">Answer and score points</Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card>
          <CardActionArea onClick={async () => { if (navigator.share) await navigator.share({ title: 'Expert MCQs', url: location.href }) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShareIcon color="action" />
                <Box>
                  <Typography variant="h6">Share App</Typography>
                  <Typography variant="body2">Invite your friends</Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
      {lastSeen && (
        <Box sx={{ mt: 2 }}>
          <Button size="small" href={lastSeen}>Continue last seen</Button>
        </Box>
      )}
    </Shell>
  )
}


