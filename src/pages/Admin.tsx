import { Box, Button, Card, CardActions, CardContent, Typography, TextField, Stack, Divider, Alert, Chip } from '@mui/material'
import IconSelect from '../components/IconSelect'
import Shell from '../layout/Shell'
import AdminMCQTable from '../components/AdminMCQTable'
import AdminCommentsPanel from '../components/AdminCommentsPanel'
import AdminUsersTable from '../components/AdminUsersTable'
import { useAuth } from '../providers/AuthProvider'
import { useEffect, useState } from 'react'
import { approveMCQ, fetchPendingMCQs, fetchUsers, submitMCQ, fetchCategories } from '../services/db'
import type { MCQ, UserProfile } from '../types'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import { collection, doc, addDoc, writeBatch, setDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'

export default function AdminPage() {
  const { user } = useAuth()
  // Debug: Log user object to verify isAdmin
  console.log('AdminPage user:', user)
  const leftItems = [
    { label: 'Dashboard', href: '#/admin' },
    { label: 'Pending MCQs', href: '#/admin/mcqs' },
    { label: 'User Progress', href: '#/admin/users' },
  ]
  if (!user) {
    return <Box sx={{ p: 4 }}><Typography variant="h6">Please log in to access the admin panel.</Typography></Box>;
  }
  if (!user.isAdmin) {
    return <Box sx={{ p: 4 }}><Typography variant="h6" color="error">Access denied. You are not an admin.</Typography></Box>;
  }
  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>Admin Panel</Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>Logged in as: {user?.email || '—'} ({user?.uid || '—'})</Typography>
      <Button variant="outlined" size="small" sx={{ mb: 2 }} onClick={seedSampleData} disabled={!user}>Seed sample data</Button>
      <Divider sx={{ my: 2 }} />
      <AdminMCQForm />
      <Divider sx={{ my: 2 }} />
      <AdminMCQTable />
      <Divider sx={{ my: 2 }} />
  <CategoryManager />
      <Divider sx={{ my: 2 }} />
      <CSVUploadForm />
      <Divider sx={{ my: 2 }} />
      <Dashboard />
      <Divider sx={{ my: 2 }} />
  <AdminCommentsPanel />
  <Divider sx={{ my: 2 }} />
  <AdminUsersTable />
    </Shell>
  );
}

function Dashboard() {
  const [pending, setPending] = useState<MCQ[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
    const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingMCQs(20).then(setPending).catch(() => setPending([]))
      fetchUsers(20).then(setUsers).catch((e) => {
        setUsers([])
        setUserError('Error fetching users: ' + e)
        console.error('Error fetching users:', e)
      })
  }, [])

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Pending MCQs ({pending.length})</Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, mb: 4 }}>
        {pending.map((m) => (
          <Card key={m.id}>
            <CardContent>
              <Typography variant="subtitle1">{m.question}</Typography>
              <Typography variant="caption" color="text.secondary">Category: {m.categoryId}</Typography>
              {m.createdByDisplayName && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Submitted by: {m.createdByDisplayName}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={async () => { await approveMCQ(m.id); setPending((p) => p.filter((x) => x.id !== m.id)) }}>Approve</Button>
            </CardActions>
          </Card>
        ))}
        {pending.length === 0 && <Typography variant="body2">No pending items.</Typography>}
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>Recent Users</Typography>
        {userError && <Alert severity="error">{userError}</Alert>}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}>
        {users.map((u) => (
          <Card key={u.uid}>
            <CardContent>
              <Typography variant="subtitle1">{u.displayName || 'User'}</Typography>
              <Typography variant="caption" color="text.secondary">{u.email || '—'}</Typography>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && <Typography variant="body2">No users yet.</Typography>}
      </Box>

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Scores by Category (from recent users)</Typography>
      <Box sx={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={aggregateScoresByCategory(users)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <RTooltip />
            <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

function aggregateScoresByCategory(users: UserProfile[]): { category: string; score: number }[] {
  const totals: Record<string, number> = {}
  for (const u of users) {
    const map = u.scoreByCategory || {}
    for (const [cat, val] of Object.entries(map)) {
      totals[cat] = (totals[cat] || 0) + (val || 0)
    }
  }
  return Object.entries(totals).map(([category, score]) => ({ category, score }))
}

async function seedSampleData() {
  try {
    // Categories via batch (atomic)
    const categories = [
      { id: 'english', name: 'English Language' },
      { id: 'computer', name: 'Computer Information' },
      { id: 'programming', name: 'Programming' },
    ]
    const batch = writeBatch(db)
    for (const c of categories) {
      batch.set(doc(db, 'categories', c.id), c, { merge: true })
    }
    await batch.commit()

    // MCQs (approved)
    const mcqs: Omit<MCQ, 'id'>[] = [
          {
      question: 'What is the synonym of "quick"?',
      options: ['Slow', 'Rapid', 'Late', 'Dull'],
      answerIndex: 1,
      explanation: 'Quick and rapid are synonyms.',
      categoryId: 'english',
      approved: true,
      createdByDisplayName: 'Admin',
    },
    {
      question: 'Which device is an input device?',
      options: ['Monitor', 'Keyboard', 'Printer', 'Speaker'],
      answerIndex: 1,
      explanation: 'Keyboard is used to input data.',
      categoryId: 'computer',
      approved: true,
      createdByDisplayName: 'Admin',
    },
    {
      question: 'Which language runs in a browser?',
      options: ['C++', 'Java', 'Python', 'JavaScript'],
      answerIndex: 3,
      explanation: 'JavaScript runs in all major browsers.',
      categoryId: 'programming',
      approved: true,
      createdByDisplayName: 'Admin',
    },
    ]
    await Promise.all(mcqs.map((m) => addDoc(collection(db, 'mcqs'), m)))
      alert('Seeded categories and sample MCQs! Reload Practice/Quiz.')
} catch (e: any) {
  console.error('Seeding failed', e)
  alert(`Seeding failed: ${e?.message || 'Unknown error'}\nIf this is permission denied, allow writes in Firestore rules temporarily or run seeding from Firebase Console.`)
}
}

function CategoryManager() {
  const [editSubcatId, setEditSubcatId] = useState('')
  const [editSubcatName, setEditSubcatName] = useState('')
  const [editSubcatIcon, setEditSubcatIcon] = useState('')

  const editSubcategory = async () => {
    if (!selectedCatId || !editSubcatId || !editSubcatName.trim()) {
      setStatus('Select a subcategory and enter a name')
      return
    }
    try {
      const cat = categories.find((c) => c.id === selectedCatId)
      const subcategories = Array.isArray(cat?.subcategories) ? [...cat.subcategories] : []
      const idx = subcategories.findIndex((s: any) => s.id === editSubcatId)
      if (idx === -1) return
      subcategories[idx].name = editSubcatName.trim()
      if (editSubcatIcon) subcategories[idx].icon = editSubcatIcon
      else delete subcategories[idx].icon
      await setDoc(doc(db, 'categories', selectedCatId), { subcategories }, { merge: true })
      setStatus('Subcategory updated!')
      setEditSubcatId(''); setEditSubcatName(''); setEditSubcatIcon('')
      fetchCategories().then(setCategories).catch(() => setCategories([]))
    } catch (error: any) {
      setStatus('Failed to update subcategory: ' + (error?.message || 'Unknown error'))
    }
  }

  const deleteSubcategory = async (catId: string, subcatId: string) => {
    // Check for MCQs in this subcategory
    const snap = await getDocs(query(collection(db, 'mcqs'), where('categoryId', '==', catId), where('subcategoryId', '==', subcatId)))
    if (!snap.empty) {
      setStatus('Cannot delete: MCQs exist in this subcategory')
      return
    }
    const cat = categories.find((c) => c.id === catId)
    const subcategories = Array.isArray(cat?.subcategories) ? [...cat.subcategories] : []
    const filtered = subcategories.filter((s: any) => s.id !== subcatId)
    await setDoc(doc(db, 'categories', catId), { subcategories: filtered }, { merge: true })
    setStatus('Subcategory deleted!')
    fetchCategories().then(setCategories).catch(() => setCategories([]))
  }
  const [categories, setCategories] = useState<any[]>([])
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('')
  const [editCatId, setEditCatId] = useState('')
  const [editCatName, setEditCatName] = useState('')
  const [editCatIcon, setEditCatIcon] = useState('')
  const [subcatName, setSubcatName] = useState('')
  const [subcatIcon, setSubcatIcon] = useState('')
  const [selectedCatId, setSelectedCatId] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  const addCategory = async () => {
    if (!newCategoryId.trim() || !newCategoryName.trim()) {
      setStatus('Please enter both ID and name')
      return
    }
    try {
      const data: any = { id: newCategoryId.trim(), name: newCategoryName.trim() }
      if (newCategoryIcon) data.icon = newCategoryIcon
      await setDoc(doc(db, 'categories', newCategoryId.trim()), data)
      setStatus('Category added successfully!')
      setNewCategoryId('')
      setNewCategoryName('')
      setNewCategoryIcon('')
      fetchCategories().then(setCategories).catch(() => setCategories([]))
    } catch (error: any) {
      console.error('Category creation error:', error)
      setStatus(`Failed to add category: ${error?.message || 'Unknown error'}`)
    }
  }

  const editCategory = async () => {
    if (!editCatId || !editCatName.trim()) {
      setStatus('Select a category and enter a name')
      return
    }
    try {
      const data: any = { name: editCatName.trim() }
      if (editCatIcon) data.icon = editCatIcon
      await setDoc(doc(db, 'categories', editCatId), data, { merge: true })
      setStatus('Category updated!')
      setEditCatId(''); setEditCatName(''); setEditCatIcon('')
      fetchCategories().then(setCategories).catch(() => setCategories([]))
    } catch (error: any) {
      setStatus('Failed to update category: ' + (error?.message || 'Unknown error'))
    }
  }

  const addSubcategory = async () => {
    if (!selectedCatId || !subcatName.trim()) {
      setStatus('Select a category and enter subcategory name')
      return
    }
    try {
      const cat = categories.find((c) => c.id === selectedCatId)
  const subcategories = Array.isArray(cat?.subcategories) ? [...cat.subcategories] : []
  const newSubcat: any = { id: subcatName.trim().toLowerCase().replace(/\s+/g, '-'), name: subcatName.trim() }
  if (subcatIcon) newSubcat.icon = subcatIcon
  subcategories.push(newSubcat)
  await setDoc(doc(db, 'categories', selectedCatId), { ...cat, subcategories }, { merge: true })
      setStatus('Subcategory added!')
      setSubcatName('')
      setSubcatIcon('')
      fetchCategories().then(setCategories).catch(() => setCategories([]))
    } catch (error: any) {
      setStatus('Failed to add subcategory: ' + (error?.message || 'Unknown error'))
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Manage Categories</Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Add New Category:</Typography>
            <Stack direction="row" spacing={1}>
              <TextField 
                label="Category ID" 
                value={newCategoryId} 
                onChange={(e) => setNewCategoryId(e.target.value)}
                placeholder="e.g., science"
                size="small"
              />
              <TextField 
                label="Category Name" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Science"
                size="small"
              />
              <IconSelect
                value={newCategoryIcon}
                onChange={setNewCategoryIcon}
                label="Icon"
              />
              <Button variant="contained" onClick={addCategory} size="small">
                Add
              </Button>
            </Stack>

            <Typography variant="subtitle2">Add Subcategory:</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                select
                label="Category"
                value={selectedCatId}
                onChange={e => setSelectedCatId(e.target.value)}
                SelectProps={{ native: true }}
                size="small"
                sx={{ minWidth: 120 }}
                inputProps={{ 'aria-label': 'Category select', title: 'Category select' }}
                title="Category select"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </TextField>
              <TextField
                label="Subcategory Name"
                value={subcatName}
                onChange={e => setSubcatName(e.target.value)}
                placeholder="e.g., Algebra"
                size="small"
              />
              <TextField
                label="Icon (optional)"
                value={subcatIcon}
                onChange={e => setSubcatIcon(e.target.value)}
                placeholder="e.g., 🧮"
                size="small"
              />
              <Button variant="contained" onClick={addSubcategory} size="small">Add</Button>
            </Stack>
            
            <Typography variant="subtitle2">Existing Categories:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {categories.map((cat) => (
                <Box key={cat.id} sx={{ mb: 1, border: '1px solid #eee', borderRadius: 2, p: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={cat.icon ? `${cat.icon} ${cat.name}` : cat.name} variant="outlined" />
                    <Button size="small" onClick={() => { setEditCatId(cat.id); setEditCatName(cat.name); setEditCatIcon(cat.icon || '') }}>Edit</Button>
                  </Stack>
                  {editCatId === cat.id && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <TextField label="Name" value={editCatName} onChange={e => setEditCatName(e.target.value)} size="small" />
                      <IconSelect value={editCatIcon} onChange={setEditCatIcon} label="Icon" />
                      <Button size="small" variant="contained" onClick={editCategory}>Save</Button>
                      <Button size="small" onClick={() => { setEditCatId(''); setEditCatName(''); setEditCatIcon('') }}>Cancel</Button>
                    </Stack>
                  )}
                  {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && (
                    <Box sx={{ ml: 2, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {cat.subcategories.map((sub: any) => (
                        <Stack key={sub.id} direction="row" spacing={1} alignItems="center">
                          <Chip label={sub.icon ? `${sub.icon} ${sub.name}` : sub.name} size="small" />
                          <Button size="small" onClick={() => { setSelectedCatId(cat.id); setEditSubcatId(sub.id); setEditSubcatName(sub.name); setEditSubcatIcon(sub.icon || '') }}>Edit</Button>
                          <Button size="small" color="error" onClick={() => deleteSubcategory(cat.id, sub.id)}>Delete</Button>
                        </Stack>
                      ))}
                      {editSubcatId && selectedCatId === cat.id && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <TextField label="Name" value={editSubcatName} onChange={e => setEditSubcatName(e.target.value)} size="small" />
                          <IconSelect value={editSubcatIcon} onChange={setEditSubcatIcon} label="Icon" />
                          <Button size="small" variant="contained" onClick={editSubcategory}>Save</Button>
                          <Button size="small" onClick={() => { setEditSubcatId(''); setEditSubcatName(''); setEditSubcatIcon('') }}>Cancel</Button>
                        </Stack>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
            
            {status && (
              <Alert severity={status.includes('successfully') ? 'success' : 'error'}>
                {status}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

function CSVUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      parseCSV(selectedFile)
    } else {
      setStatus('Please select a valid CSV file')
      setFile(null)
      setPreview([])
    }
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        // Expected headers: question,option1,option2,option3,option4,answerIndex,categoryId,subcategoryId,explanation
        const expectedHeaders = ['question', 'option1', 'option2', 'option3', 'option4', 'answerIndex', 'categoryId', 'subcategoryId', 'explanation']
        if (!expectedHeaders.every(h => headers.includes(h))) {
          setStatus('CSV must have columns: question, option1, option2, option3, option4, answerIndex, categoryId, subcategoryId, explanation')
          setPreview([])
          return
        }
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          return {
            question: values[0],
            options: [values[1], values[2], values[3], values[4]],
            answerIndex: parseInt(values[5]) || 0,
            categoryId: values[6],
            subcategoryId: values[7],
            explanation: values[8] || ''
          }
        }).filter(row => row.question && row.options.every(opt => opt))
        setPreview(data.slice(0, 5)) // Show first 5 rows as preview
        setStatus(`CSV parsed successfully! Found ${data.length} MCQs. First 5 rows shown below.`)
      } catch (error) {
        setStatus('Error parsing CSV file')
        setPreview([])
      }
    }
    reader.readAsText(file)
  }

  const uploadCSV = async () => {
    if (!file) return
    
    setIsUploading(true)
    setStatus('Uploading MCQs...')
    
    try {
      const csv = await file.text()
      const lines = csv.split('\n').filter(line => line.trim())
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        return {
          question: values[0],
          options: [values[1], values[2], values[3], values[4]],
          answerIndex: parseInt(values[5]) || 0,
          categoryId: values[6],
          subcategoryId: values[7],
          explanation: values[8] || ''
        }
      }).filter(row => row.question && row.options.every(opt => opt))

      // Upload all MCQs
      for (const mcq of data) {
        await addDoc(collection(db, 'mcqs'), { 
          ...mcq, 
          approved: true,
          createdByDisplayName: 'Admin'
        })
      }

      setStatus(`Successfully uploaded ${data.length} MCQs!`)
      setFile(null)
      setPreview([])
      // Reset file input
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setStatus(`Upload failed: ${error}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Upload MCQs via CSV (Admin - Auto-approved)</Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="info">
              CSV format: question,option1,option2,option3,option4,answerIndex,categoryId,subcategoryId,explanation
              <br />
              answerIndex: 0-3 (0 = first option, 3 = last option)
              <br />
              categoryId and subcategoryId must match your categories/subcategories.
            </Alert>
            
            <Button variant="outlined" component="label" disabled={isUploading}>
              Choose CSV File
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                title="Upload CSV file"
                placeholder="Choose CSV file"
                aria-label="Upload CSV file"
              />
            </Button>
            
            {file && (
              <Typography variant="body2">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Typography>
            )}

            {preview.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview (first 5 rows):</Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', p: 1, borderRadius: 1 }}>
                  {preview.map((row, i) => (
                    <Box key={i} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Q: {row.question}</Typography>
                      <br />
                      <Typography variant="caption">
                        A: {row.options.join(' | ')} | Correct: {row.answerIndex + 1} | Category: {row.categoryId}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Button 
              variant="contained" 
              onClick={uploadCSV} 
              disabled={!file || isUploading}
              fullWidth
            >
              {isUploading ? 'Uploading...' : `Upload ${preview.length > 0 ? preview.length + '+' : ''} MCQs`}
            </Button>
            
            {status && (
              <Alert severity={status.includes('Successfully') ? 'success' : status.includes('Error') ? 'error' : 'info'}>
                {status}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

function AdminMCQForm() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', '', '', ''])
  const [answerIndex, setAnswerIndex] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [explanation, setExplanation] = useState('')
  const [status, setStatus] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  useEffect(() => { fetchCategories().then(setCategories).catch(() => setCategories([])) }, [])

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Add MCQ (Admin - Auto-approved)</Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} fullWidth />
            <Stack spacing={1}>
              {options.map((opt, i) => (
                <TextField key={i} label={`Option ${i + 1}${i === answerIndex ? ' (Correct)' : ''}`} value={opt} onChange={(e) => setOptions((o) => o.map((x, idx) => (idx === i ? e.target.value : x)))} fullWidth />
              ))}
            </Stack>
            <TextField
              select
              label="Category"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId('') }}
              SelectProps={{ native: true }}
              title="Select category"
              aria-label="Select category"
              inputProps={{ 'aria-label': 'Select category', title: 'Select category' }}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </TextField>

            <TextField
              select
              label="Subcategory"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              SelectProps={{ native: true }}
              title="Select subcategory"
              aria-label="Select subcategory"
              disabled={!categoryId || !(categories.find(c => c.id === categoryId)?.subcategories?.length > 0)}
              inputProps={{ 'aria-label': 'Select subcategory', title: 'Select subcategory' }}
            >
              <option value="">Select subcategory</option>
              {(categories.find(c => c.id === categoryId)?.subcategories || []).map((sub: any) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </TextField>
            <TextField label="Explanation (optional)" value={explanation} onChange={(e) => setExplanation(e.target.value)} fullWidth multiline minRows={2} />
            <Button variant="contained" onClick={async () => {
              try {
                // Remove subcategoryId as MCQ type does not support it
                await submitMCQ({ question, options, answerIndex, explanation, categoryId, createdByUid: 'admin' }, 'Admin')
                setStatus('MCQ added successfully!')
                setQuestion(''); setOptions(['', '', '', '']); setExplanation(''); setCategoryId(''); setSubcategoryId(''); setAnswerIndex(0)
              } catch (e) {
                setStatus('Failed to add MCQ.')
              }
            }}>Add MCQ</Button>
            {status && <Typography variant="caption">{status}</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}


