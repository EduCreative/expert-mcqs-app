import { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { fetchCommentsForAdmin, approveComment, revokeComment, editComment, fetchMCQsByIds } from '../services/db';
import type { Comment as BaseComment } from '../types';


export default function AdminCommentsPanel() {
  type AdminComment = BaseComment & { approved?: boolean };
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [mcqs, setMcqs] = useState<Record<string, import('../types').MCQ>>({});
  const [editDialog, setEditDialog] = useState<{ open: boolean; comment: AdminComment | null }>({ open: false, comment: null });
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    const all = await fetchCommentsForAdmin();
    setComments(all);
    // Fetch all unique MCQ IDs for these comments
    const mcqIds = Array.from(new Set(all.map(c => c.mcqId)));
    if (mcqIds.length > 0) {
      const mcqList = await fetchMCQsByIds(mcqIds);
      const mcqMap: Record<string, import('../types').MCQ> = {};
      mcqList.forEach(m => { mcqMap[m.id] = m; });
      setMcqs(mcqMap);
    }
  }

  const handleApprove = async (id: string) => {
    await approveComment(id);
    loadComments();
  };
  const handleRevoke = async (id: string) => {
    await revokeComment(id);
    loadComments();
  };
  const handleEdit = (comment: AdminComment) => {
    setEditDialog({ open: true, comment });
    setEditText(comment.text);
  };
  const handleEditSave = async () => {
    if (editDialog.comment) {
      await editComment(editDialog.comment.id, editText);
      setEditDialog({ open: false, comment: null });
      loadComments();
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>MCQ Comments Moderation</Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 500, mb: 3 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Comment</TableCell>
              <TableCell>By</TableCell>
              <TableCell>MCQ</TableCell>
              <TableCell>Approved</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.map((c) => (
              <TableRow key={c.id} sx={{ bgcolor: c.approved ? 'white' : '#fffbe6' }}>
                <TableCell>{c.text}</TableCell>
                <TableCell>{c.displayName || c.uid}</TableCell>
                <TableCell>{mcqs[c.mcqId]?.question || <em>Loading...</em>}</TableCell>
                <TableCell>{c.approved ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {!c.approved && <Button size="small" color="success" onClick={() => handleApprove(c.id)}>Approve</Button>}
                  {c.approved && <Button size="small" color="warning" onClick={() => handleRevoke(c.id)}>Revoke</Button>}
                  <Button size="small" onClick={() => handleEdit(c)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, comment: null })}>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField fullWidth value={editText} onChange={e => setEditText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, comment: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
