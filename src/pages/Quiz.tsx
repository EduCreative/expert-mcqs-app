import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, CardActionArea, Divider, IconButton, Stack, TextField, Typography } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

import Shell from '../layout/Shell'
import HomeIcon from '@mui/icons-material/Home';
import QuizIcon from '@mui/icons-material/Quiz'
import SchoolIcon from '@mui/icons-material/School'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddCardIcon from '@mui/icons-material/AddCard'
import InfoIcon from '@mui/icons-material/Info'

import { addFavorite, incrementUserScore, addUserComment, fetchComments, fetchCategories, fetchMCQsByCategoryRandom } from '../services/db'
import type { Category, MCQ } from '../types'
import { useAuth } from '../providers/AuthProvider'
import type { Theme } from '@mui/material/styles'

export default function Quiz() {
  const { user, refreshUser } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [mcqs, setMcqs] = useState<MCQ[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [answeredMCQs, setAnsweredMCQs] = useState<Set<string>>(new Set())
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Record<string, { id: string; text: string; displayName?: string | null }[]>>({})
  const [newComment, setNewComment] = useState('')


  // Fetch categories on mount
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  // Fetch MCQs when category or subcategory changes
  useEffect(() => {
    if (!categoryId) {
      setMcqs([])
      setIndex(0)
      return
    }
    //fetchMCQsByCategorySequential(categoryId, 100).then((data) => {
    fetchMCQsByCategoryRandom(categoryId).then((data) => {
      let filtered = data
      if (subcategoryId) {
        filtered = data.filter((mcq) => mcq.subcategoryId === subcategoryId)
      }
      setMcqs(filtered)
      setIndex(0)
    }).catch(() => {
      setMcqs([])
      setIndex(0)
    })
  }, [categoryId, subcategoryId])

  const current = mcqs[index]
  // Main navigation options for hamburger menu
  const leftItems = [
    { label: 'Home', href: '#/', icon: <HomeIcon color="primary" /> },
    { label: 'Dashboard', href: '#/dashboard', icon: <DashboardIcon color="primary" /> },
    { label: 'Practice', href: '#/practice', icon: <SchoolIcon color="primary" /> },
    { label: 'Quiz', href: '#/quiz', icon: <QuizIcon color="secondary" /> },
    { label: 'Favorites', href: '#/favorites', icon: <FavoriteIcon color="primary" />},
    { label: 'Submit MCQs', href: '#/submit', icon: <AddCardIcon color="primary" /> },
    { label: 'About Us', href: '#/about', icon: <InfoIcon color="primary" /> },
    { label: 'Contact Us', href: '#/contact', icon: <ContactPageIcon color="primary" /> },
  ]

  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>Quiz Mode</Typography>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 3 }}>
        {categories.map((c) => (
          <Card key={c.id} sx={{ width: 120, height: 120, m: 0.5, boxShadow: c.id === categoryId ? 4 : 1, border: c.id === categoryId ? '2px solid #6366f1' : '1px solid #eee', bgcolor: c.id === categoryId ? 'primary.dark' : 'background.paper', borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => { setCategoryId(c.id); setSubcategoryId('') }}>
            <CardActionArea sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 1 }}>
                <Box sx={{ fontSize: 40, mb: 1 }}>
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    c.icon || '📚'
                  )}
                </Box>
                <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600, fontSize: 16, color: c.id === categoryId ? 'primary.main' : 'text.primary', wordBreak: 'break-word' }}>
                  {c.name}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
      {/* Subcategories - require selection before showing MCQs */}
      {(() => {
        const cat = categories.find(c => c.id === categoryId);
        if (cat && Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
          return (
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 2 }}>
              {cat.subcategories.map((sub: any) => (
                <Card key={sub.id} sx={{ width: 90, height: 90, m: 0.5, boxShadow: sub.id === subcategoryId ? 3 : 1, border: sub.id === subcategoryId ? '2px solid #2a2b6dff' : '1px solid #eee', bgcolor: sub.id === subcategoryId ? 'primary.dark' : 'background.paper', borderRadius: 1, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setSubcategoryId(sub.id)}>
                  <CardActionArea sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 1 }}>
                      <Box sx={{ fontSize: 28, mb: 1 }}>
                        {sub.icon || '📚'}
                      </Box>
                      <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600, fontSize: 13, color: sub.id === subcategoryId ? 'primary.main' : 'text.primary', wordBreak: 'break-word' }}>
                        {sub.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
          )
        }
        return null;
      })()}
  {/* Require both category and subcategory selection before showing MCQs */}
  {categoryId && (categories.find(c => c.id === categoryId)?.subcategories?.length ? subcategoryId : true) && current ? (
        <>
          <Card sx={{ borderRadius: 3, boxShadow: 4, border: '2px solid #6366f1', mb: 3, position: 'relative', overflow: 'visible' }}>
            <CardContent>
              {/* Category icon and name */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 22 }}>
                  {categories.find(c => c.id === current.categoryId)?.icon || '📚'}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: 18 }}>
                  {categories.find(c => c.id === current.categoryId)?.name || ''}
                </Typography>
              </Stack>
              <Typography variant="subtitle2" color="text.secondary">Score: {score}</Typography>
              {answeredMCQs.has(current.id) && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1 }}>
                  ✓ Already answered correctly (no points for repeat)
                </Typography>
              )}
              <Typography variant="h6" sx={{ mb: 1 }}>{current.question}</Typography>
              {current.createdByDisplayName && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Submitted by: {current.createdByDisplayName}
                </Typography>
              )}
              <IconButton size="small" sx={{ mb: 1 }} onClick={async () => {
                if (!user) return
                await addFavorite(user.uid, current.id)
                setFavorites((f) => Array.from(new Set([...f, current.id])))
              }}>
                {favorites.includes(current.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
              <Stack spacing={1}>
                {current.options.map((opt: string, i: number) => {
                  let sx: any = {
                    p: 1.5,
                    borderRadius: 2,
                    fontSize: 17,
                    cursor: answered ? 'default' : 'pointer',
                    border: (theme: Theme) => `1px solid ${theme.palette.mode === 'dark' ? '#333a4d' : '#eee'}`,
                    //border: '2px solid #ef4444',
                    fontWeight: 400,
                    backgroundColor: (theme: Theme) => theme.palette.mode === 'dark' ? '#181f36' : '#f5f5f5',
                    color: (theme: Theme) => theme.palette.text.primary,
                    transition: 'all 0.2s',
                  };
                  if (!answered && selected === i) {
                    sx = {
                      ...sx,
                      backgroundColor: (theme: Theme) => theme.palette.mode === 'dark' ? '#22306d' : '#c7d2fe',
                      border: (theme: Theme) => `2px solid ${theme.palette.primary.main}`,
                      //border: '2px solid #ef4444',
                      fontWeight: 600,
                    };
                  }
                  if (answered) {
                    if (i === current.answerIndex) {
                      sx = {
                        ...sx,
                        backgroundColor: (theme: Theme) => theme.palette.mode === 'dark' ? '#1e3a2a' : '#bbf7d0',
                        //border: (theme: Theme) => `2px solid #22c55e`,
                        border: '2px solid #22c55e',
                        fontWeight: 600,
                      };
                    } else if (selected === i && selected !== current.answerIndex) {
                      sx = {
                        ...sx,
                        backgroundColor: (theme: Theme) => theme.palette.mode === 'dark' ? '#4b1e1e' : '#fecaca',
                        //border: (theme: Theme) => `2px solid #ef4444`,
                        border: '2px solid #ef4444',
                        fontWeight: 600,
                      };
                    } else {
                      sx = { ...sx, opacity: 0.7 };
                    }
                  }
                  return (
                    <Box key={i} onClick={() => !answered && setSelected(i)} sx={sx}>
                      {opt}
                    </Box>
                  )
                })}
              </Stack>
              {!answered && selected !== null && (
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={async () => {
                  if (selected === current.answerIndex) {
                    // Only give points if user hasn't answered this MCQ correctly before
                    const hasAnswered = answeredMCQs.has(current.id)
                    if (!hasAnswered) {
                      setScore((s) => s + 1)
                      if (user) {
                        try {
                          await incrementUserScore(user.uid, categoryId, 1, current.id)
                          await refreshUser() // Refresh user data to update points in TopBar
                          // Mark this MCQ as answered
                          setAnsweredMCQs(prev => new Set([...prev, current.id]))
                        } catch (error) {
                          console.warn('Score update failed but continuing:', error)
                          // Score will be updated locally as fallback
                        }
                      }
                    } else {
                      // User already answered this correctly before
                      console.log('Already answered this MCQ correctly - no points given')
                    }
                  }
                  // Set answered to true to show explanation and enable Next button
                  setAnswered(true)
                }}>
                  Submit Answer
                </Button>
              )}
              {answered && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="subtitle2">Explanation</Typography>
                  <Typography variant="body2">{current.explanation || '—'}</Typography>
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Button size="small" onClick={async () => {
                  setShowComments((s) => !s)
                  if (!showComments) {
                    const list = await fetchComments(current.id)
                    setComments((prev) => ({
                      ...prev,
                      [current.id]: list.filter((c: any) => c.approved).map((c: any) => ({
                        id: c.id,
                        text: c.text,
                        displayName: c.displayName ?? undefined
                      }))
                    }))
                  }
                }}>{showComments ? 'Hide' : 'Show'} comments</Button>
                {showComments && (
                  <Box sx={{ mt: 1 }}>
                    {(comments[current.id] || []).map((c: any) => (
                      <Typography key={c.id} variant="body2" sx={{ mb: 0.5 }}>• {c.text} {c.displayName ? `— ${c.displayName}` : ''}</Typography>
                    ))}
                    {user && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <TextField size="small" placeholder="Add a comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} fullWidth />
                        <Button size="small" variant="contained" onClick={async () => {
                          if (!newComment.trim()) return
                          await addUserComment(current.id, user.uid, newComment.trim(), user.displayName)
                          setNewComment('')
                          alert('Comment needs Admin approval to show.')
                          // Optionally, re-fetch comments to update UI
                          const list = await fetchComments(current.id)
                          setComments((prev) => ({
                            ...prev,
                            [current.id]: list.filter((c: any) => c.approved).map((c: any) => ({
                              id: c.id,
                              text: c.text,
                              displayName: c.displayName ?? undefined
                            }))
                          }))
                        }}>
                          Post
                        </Button>
                      </Stack>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
          {/* MCQ navigation bar: only allow navigation after answering */}
          {mcqs.length > 1 && (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
              <Button size="small" variant="outlined" disabled={index === 0 || !answered} onClick={() => { setIndex(i => Math.max(0, i - 1)); setAnswered(false); setSelected(null); }}>
                Previous
              </Button>
              <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'center' }}>
                MCQ {index + 1} / {mcqs.length}
              </Typography>
              <Button size="small" variant="outlined" disabled={index === mcqs.length - 1 || !answered} onClick={() => { setIndex(i => Math.min(mcqs.length - 1, i + 1)); setAnswered(false); setSelected(null); }}>
                Next
              </Button>
            </Stack>
          )}
        </>
      ) : null}
    </Shell>
  )
}