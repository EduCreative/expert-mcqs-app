import { useState } from 'react'
import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import Shell from '../layout/Shell'
import { submitMCQ } from '../services/db'
import { useAuth } from '../providers/AuthProvider'

export default function Submit() {
  const { user } = useAuth()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', '', '', ''])
  const [answerIndex, setAnswerIndex] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [explanation, setExplanation] = useState('')
  const [status, setStatus] = useState('')

  const leftItems = [
    { label: 'Home', href: '#/' },
    { label: 'Practice', href: '#/practice' },
    { label: 'Quiz', href: '#/quiz' },
    { label: 'Favorites', href: '#/favorites' },
  ]

  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>Submit MCQ</Typography>
      {!user && <Typography variant="body2" sx={{ mb: 2 }}>Login to submit MCQs.</Typography>}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} fullWidth />
            <Stack spacing={1}>
              {options.map((opt, i) => (
                <TextField key={i} label={`Option ${i + 1}${i === answerIndex ? ' (Correct)' : ''}`} value={opt} onChange={(e) => setOptions((o) => o.map((x, idx) => (idx === i ? e.target.value : x)))} fullWidth />
              ))}
            </Stack>
            <TextField label="Answer Index (0-3)" type="number" value={answerIndex} onChange={(e) => setAnswerIndex(parseInt(e.target.value) || 0)} />
            <TextField label="Category ID" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} />
            <TextField label="Explanation (optional)" value={explanation} onChange={(e) => setExplanation(e.target.value)} fullWidth multiline minRows={2} />
            <Button variant="contained" disabled={!user} onClick={async () => {
              try {
                  await submitMCQ({ question, options, answerIndex, explanation, categoryId, createdByUid: user?.uid ?? undefined }, (user?.displayName ?? undefined) || (user?.email ?? undefined))
                setStatus('Submitted for approval!')
                setQuestion(''); setOptions(['', '', '', '']); setExplanation(''); setCategoryId(''); setAnswerIndex(0)
              } catch (e) {
                setStatus('Failed to submit.')
              }
            }}>Submit</Button>
            {status && <Typography variant="caption">{status}</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Shell>
  )
}


