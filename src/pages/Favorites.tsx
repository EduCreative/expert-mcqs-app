import { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Box, Divider } from '@mui/material'
import Shell from '../layout/Shell'
import { fetchFavoriteMcqIds, fetchMCQsByIds } from '../services/db'
import { useAuth } from '../providers/AuthProvider'
import type { MCQ } from '../types'
//import { useState } from 'react'

export default function Favorites() {
  const { user } = useAuth()
  const [mcqs, setMcqs] = useState<MCQ[]>([])

  useEffect(() => {
    if (!user) return
    fetchFavoriteMcqIds(user.uid)
      .then(fetchMCQsByIds)
      .then(setMcqs)
      .catch(() => setMcqs([]))
  }, [user?.uid])

  const leftItems = [
    { label: 'Home', href: '#/' },
    { label: 'Practice', href: '#/practice' },
    { label: 'Quiz', href: '#/quiz' },
    { label: 'Favorites', href: '#/favorites' },
  ]

  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>Favorite MCQs</Typography>
      {!user && <Typography variant="body2">Login to view and manage your favorites.</Typography>}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {mcqs.map((m: MCQ) => (
          <Card key={m.id}>
            <CardContent>
              <Typography variant="subtitle1">{m.question}</Typography>
              <Typography variant="caption" color="text.secondary">Category: {m.categoryId}</Typography>
              {m.answerIndex !== undefined && m.options[m.answerIndex] && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="primary">Answer: {m.options[m.answerIndex]}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
      {user && mcqs.length === 0 && (
        <Typography variant="body2" sx={{ mt: 2 }}>No favorites yet.</Typography>
      )}
    </Shell>
  )
}