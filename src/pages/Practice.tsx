import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, IconButton, Stack, TextField, Typography } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { addFavorite, fetchCategories, fetchFavoriteMcqIds, fetchMCQsByCategorySequential, addUserComment, fetchComments } from '../services/db'
import type { Category, MCQ } from '../types'
import Shell from '../layout/Shell'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { useUI } from '../providers/UIProvider'

import HomeIcon from '@mui/icons-material/Home';
import QuizIcon from '@mui/icons-material/Quiz'
import SchoolIcon from '@mui/icons-material/School'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddCardIcon from '@mui/icons-material/AddCard'
import InfoIcon from '@mui/icons-material/Info'


export default function Practice() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string>('')
  const [mcqs, setMcqs] = useState<MCQ[]>([])
  const [index, setIndex] = useState(0)
  const [jump, setJump] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<{ [mcqId: string]: { id: string; text: string; displayName?: string | null }[] }>({})
  const [newComment, setNewComment] = useState('')
  const [subcategoryId, setSubcategoryId] = useState<string>('')
  const { setLastSyncedAt } = useUI()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchCategories().then((c) => { setCategories(c); setLastSyncedAt(Date.now()) }).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const catFromUrl = searchParams.get('cat')
    if (catFromUrl) setCategoryId(catFromUrl)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!categoryId) return
    const idxFromUrl = parseInt(searchParams.get('i') || '1')
    // If subcategoryId is set, filter MCQs by subcategoryId (if you store subcategoryId in MCQ)
    fetchMCQsByCategorySequential(categoryId, 100).then((data) => {
      let filtered = data
      if (subcategoryId) {
        filtered = data.filter((mcq) => (mcq.subcategoryId === subcategoryId))
      }
      setMcqs(filtered)
      const initialIndex = !isNaN(idxFromUrl) ? Math.min(filtered.length - 1, Math.max(0, idxFromUrl - 1)) : 0
      setIndex(initialIndex)
      setLastSyncedAt(Date.now())
    })
    if (user) fetchFavoriteMcqIds(user.uid).then(setFavorites).catch(() => setFavorites([]))
  }, [categoryId, subcategoryId])

  useEffect(() => {
    if (!categoryId || mcqs.length === 0) return
    localStorage.setItem('lastSeenPractice', JSON.stringify({ cat: categoryId, i: index + 1 }))
  }, [index, categoryId, mcqs.length])

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
  const current = mcqs[index]

  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>Practice Mode</Typography>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 3 }}>
        {categories.map((c) => {
          return (
              <Chip
                key={c.id}
                label={(c.icon ? `${c.icon} ` : '📚 ') + c.name}
                sx={{ fontSize: 18, px: 2, py: 1, borderRadius: 2, boxShadow: c.id === categoryId ? 3 : 1, border: c.id === categoryId ? '2px solid #6366f1' : '1px solid #eee', bgcolor: c.id === categoryId ? 'primary.light' : 'background.paper', minWidth: 80 }}
                clickable
                color={c.id === categoryId ? 'primary' : 'default'}
                onClick={() => { setCategoryId(c.id); setSubcategoryId('') }}
              />
          )
        })}
      </Stack>

      {/* Subcategories */}
      {(() => {
        const cat = categories.find(c => c.id === categoryId);
        return cat && Array.isArray(cat.subcategories) && cat.subcategories.length > 0 ? (
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 2 }}>
            {cat.subcategories.map((sub) => (
              <Chip
                key={sub.id}
                label={(sub.icon ? `${sub.icon} ` : '') + sub.name}
                sx={{ fontSize: 16, px: 2, py: 1, borderRadius: 2, boxShadow: sub.id === subcategoryId ? 2 : 0, border: sub.id === subcategoryId ? '2px solid #6366f1' : '1px solid #eee', bgcolor: sub.id === subcategoryId ? 'primary.light' : 'background.paper', minWidth: 60 }}
                clickable
                color={sub.id === subcategoryId ? 'primary' : 'default'}
                onClick={() => setSubcategoryId(sub.id)}
              />
            ))}
          </Stack>
        ) : null;
      })()}

      {current ? (
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
              {current.options.map((opt, i) => (
                <Box key={i} sx={{ p: 1.5, borderRadius: 2, fontSize: 17, bgcolor: i === current.answerIndex ? 'success.light' : 'action.hover', border: i === current.answerIndex ? '2px solid #22c55e' : '1px solid #eee', fontWeight: i === current.answerIndex ? 600 : 400 }}>{opt}</Box>
              ))}
            </Stack>
            {current.explanation && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="subtitle2">Explanation</Typography>
                <Typography variant="body2">{current.explanation}</Typography>
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <Button size="small" onClick={async () => {
                setShowComments((s) => !s)
                if (!showComments) {
                  const list = await fetchComments(current.id)
                  setComments((prev) => ({ ...prev, [current.id]: list.filter((c: any) => c.approved).map((c) => ({ id: c.id, text: c.text, displayName: c.displayName })) }))
                }
              }}>{showComments ? 'Hide' : 'Show'} comments</Button>
              {showComments && (
                <Box sx={{ mt: 1 }}>
                  {(comments[current.id] || []).map((c) => (
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
                        setComments((prev) => ({ ...prev, [current.id]: list.filter((c: any) => c.approved).map((c) => ({ id: c.id, text: c.text, displayName: c.displayName })) }))
                      }}>Post</Button>
                    </Stack>
                  )}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body2">Select a category to begin.</Typography>
      )}

      {mcqs.length > 0 && (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
          <IconButton disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}><ArrowBackIosNewIcon /></IconButton>
          <Typography variant="body2">{index + 1} / {mcqs.length}</Typography>
          <IconButton disabled={index === mcqs.length - 1} onClick={() => setIndex((i) => Math.min(mcqs.length - 1, i + 1))}><ArrowForwardIosIcon /></IconButton>
          <TextField size="small" placeholder="Jump to #" value={jump} onChange={(e) => setJump(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { const j = parseInt(jump); if (!isNaN(j)) setIndex(Math.min(mcqs.length - 1, Math.max(0, j - 1))) } }} />
        </Stack>
      )}
    </Shell>
  )
}


