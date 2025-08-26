import Shell from '../layout/Shell'
import { Box, Typography } from '@mui/material'

import FavoriteIcon from '@mui/icons-material/Favorite'
import HomeIcon from '@mui/icons-material/Home'
import QuizIcon from '@mui/icons-material/Quiz'
import SchoolIcon from '@mui/icons-material/School'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddCardIcon from '@mui/icons-material/AddCard'
import InfoIcon from '@mui/icons-material/Info'

export default function About() {
  // Main navigation options for hamburger menu
  const leftItems = [
    { label: 'Home', href: '#/', icon: <HomeIcon color="primary" /> },
    { label: 'Dashboard', href: '#/dashboard', icon: <DashboardIcon color="primary" /> },
    { label: 'Practice', href: '#/practice', icon: <SchoolIcon color="primary" /> },
    { label: 'Quiz', href: '#/quiz', icon: <QuizIcon color="secondary" /> },
    { label: 'Favorites', href: '#/favorites', icon: <FavoriteIcon color="primary" /> },
    { label: 'Submit MCQs', href: '#/submit', icon: <AddCardIcon color="primary" /> },
    { label: 'About Us', href: '#/about', icon: <InfoIcon color="primary" /> },
    { label: 'Contact Us', href: '#/contact', icon: <ContactPageIcon color="primary" /> },
  ]

  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        About Us
      </Typography>

      <Box sx={{ fontSize: 18, lineHeight: 1.8 }}>
        <Typography paragraph>
          Welcome to <strong>Expert MCQs</strong> — a learning platform designed to make
          test preparation simple, interactive, and effective.
        </Typography>

        <Typography paragraph>
          This app was created by <strong>Masroor Khan</strong>, a teacher of Computer
          Science, Software Engineering, and IT, with the goal of helping students
          strengthen their concepts and practice through quizzes and exercises.
        </Typography>

        <Typography paragraph>
          Along the way, this project also demonstrates how modern web applications work:
        </Typography>
        <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
          <li>How web apps are built and structured</li>
          <li>How responsive design adapts across devices</li>
          <li>How online data storage and real-time interaction function</li>
        </ul>

        <Typography paragraph>
          With <strong>Expert MCQs</strong>, you can:
        </Typography>
        <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
          <li>Practice subject-wise multiple-choice questions</li>
          <li>Attempt quizzes to test your preparation</li>
          <li>Save favorites for quick revision</li>
          <li>Access material both online and offline</li>
        </ul>

        <Typography paragraph>
          Your feedback and suggestions are always welcome. If you’d like to contribute,
          learn more about the project, or suggest new features, feel free to get in touch:
        </Typography>

        <Box sx={{ mt: 2, fontWeight: 500 }}>
          <ul style={{ marginLeft: '20px' }}>
            <li>📱 WhatsApp: <strong>+92333-1306603</strong></li>
            <li>📧 Email: <strong>kmasroor50@gmail.com</strong></li>
          </ul>
        </Box>
      </Box>
    </Shell>
  )
}
