import { useEffect, useState } from 'react';
import { Box, IconButton, MenuItem, Select, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchCategories } from '../services/db';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { MCQ, Category } from '../types';

export default function AdminMCQTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, 'mcqs'));
    if (categoryId && subcategoryId) {
      q = query(collection(db, 'mcqs'), where('categoryId', '==', categoryId), where('subcategoryId', '==', subcategoryId));
    } else if (categoryId) {
      q = query(collection(db, 'mcqs'), where('categoryId', '==', categoryId));
    }
    getDocs(q).then(snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setMcqs(data);
      setLoading(false);
      if (data.length === 0) {
        console.warn('No MCQs found for query', { categoryId, subcategoryId });
      }
    }).catch(err => {
      setLoading(false);
      console.error('Error fetching MCQs:', err);
    });
  }, [categoryId, subcategoryId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this MCQ?')) return;
    await deleteDoc(doc(db, 'mcqs', id));
    setMcqs(mcqs => mcqs.filter(m => m.id !== id));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>All MCQs</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Select value={categoryId} onChange={e => { setCategoryId(e.target.value); setSubcategoryId(''); }} displayEmpty size="small">
          <MenuItem value="">All Categories</MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
        </Select>
        {(() => {
          const cat = categories.find(c => c.id === categoryId);
          return categoryId && cat && Array.isArray(cat.subcategories) && cat.subcategories.length > 0 ? (
            <Select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} displayEmpty size="small" title="Subcategory select">
              <MenuItem value="">All Subcategories</MenuItem>
              {cat.subcategories.map(sub => (
                <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
              ))}
            </Select>
          ) : null;
        })()}
      </Stack>
      <TableContainer component={Paper} sx={{ maxHeight: 500, mb: 2 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Options</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subcategory</TableCell>
              <TableCell>Explanation</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
            ) : mcqs.length === 0 ? (
              <TableRow><TableCell colSpan={7}>No MCQs found.</TableCell></TableRow>
            ) : (
              mcqs.map(mcq => (
                <TableRow key={mcq.id} hover>
                  <TableCell sx={{ maxWidth: 300, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{mcq.question}</TableCell>
                  <TableCell>
                    {mcq.options?.map((opt, i) => (
                      <Chip key={i} label={opt} size="small" sx={{ mr: 0.5, mb: 0.5 }} color={i === mcq.answerIndex ? 'success' : 'default'} />
                    ))}
                  </TableCell>
                  <TableCell>{typeof mcq.answerIndex === 'number' && mcq.options ? mcq.options[mcq.answerIndex] : ''}</TableCell>
                  <TableCell>{categories.find(c => c.id === mcq.categoryId)?.name || mcq.categoryId}</TableCell>
                  <TableCell>{categories.find(c => c.id === mcq.categoryId)?.subcategories?.find(s => s.id === mcq.subcategoryId)?.name || mcq.subcategoryId || ''}</TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{mcq.explanation}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => alert('Edit not implemented yet')}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(mcq.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
