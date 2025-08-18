import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Button, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { fetchUsers } from '../services/db';
import { db } from '../firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '../types';

export default function AdminUsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
      fetchUsers(200).then(setUsers).catch((e) => {
        setUsers([]);
        setUserError('Error fetching users: ' + e);
        console.error('Error fetching users:', e);
      }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (uid: string) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'users', uid));
    setUsers(users => users.filter(u => u.uid !== uid));
  };

  const handlePromote = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { isAdmin: true });
    setUsers(users => users.map(u => u.uid === uid ? { ...u, isAdmin: true } : u));
  };
  const handleDemote = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { isAdmin: false });
    setUsers(users => users.map(u => u.uid === uid ? { ...u, isAdmin: false } : u));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>All Users</Typography>
        {userError && <Alert severity="error">{userError}</Alert>}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>UID</TableCell>
              <TableCell>Score By Category</TableCell>
              <TableCell>Admin?</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6}>No users found.</TableCell></TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.uid}>
                  <TableCell>{user.displayName || '—'}</TableCell>
                  <TableCell>{user.email || '—'}</TableCell>
                  <TableCell>{user.uid}</TableCell>
                  <TableCell>
                    {user.scoreByCategory ? Object.entries(user.scoreByCategory).map(([cat, score]) => (
                      <span key={cat}>{cat}: {score} <br /></span>
                    )) : '—'}
                  </TableCell>
                  <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit (not implemented)"><span><IconButton size="small" disabled><EditIcon /></IconButton></span></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(user.uid)}><DeleteIcon /></IconButton></Tooltip>
                    {!user.isAdmin ? (
                      <Tooltip title="Promote to Admin">
                        <Button size="small" color="primary" onClick={() => handlePromote(user.uid)}>
                          Make Admin
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Remove Admin">
                        <Button size="small" color="warning" onClick={() => handleDemote(user.uid)}>
                          Remove Admin
                        </Button>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => window.location.reload()}>Refresh</Button>
    </Box>
  );
}
