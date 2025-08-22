import { Box, Card, CardActionArea, CardContent, Typography, Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home';
import QuizIcon from '@mui/icons-material/Quiz'
import SchoolIcon from '@mui/icons-material/School'
import ShareIcon from '@mui/icons-material/Share'
// import AnalyticsIcon from '@mui/icons-material/Analytics'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddCardIcon from '@mui/icons-material/AddCard'
import InfoIcon from '@mui/icons-material/Info'

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
    { label: 'Home', href: '#/', icon: <HomeIcon color="primary" /> },
    { label: 'Dashboard', href: '#/dashboard', icon: <DashboardIcon color="primary" /> },
    { label: 'Practice', href: '#/practice', icon: <SchoolIcon color="primary" /> },
    { label: 'Quiz', href: '#/quiz', icon: <QuizIcon color="secondary" /> },
    { label: 'Favorites', href: '#/favorites', icon: <FavoriteIcon color="primary" />},
    { label: 'Submit MCQs', href: '#/submit', icon: <AddCardIcon color="primary" /> },
    { label: 'About Us', href: '#/about', icon: <InfoIcon color="primary" /> },
    { label: 'Contact Us', href: '#/contact', icon: <ContactPageIcon color="primary" /> }
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
          <CardActionArea href="#/dashboard">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DashboardIcon color="primary" />
                <Box>
                  <Typography variant="h6">Dashboard</Typography>
                  <Typography variant="body2">View your Progress</Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>

        
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


