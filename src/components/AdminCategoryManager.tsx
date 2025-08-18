import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchCategories } from '../services/db';
import { db } from '../firebase';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import type { Category } from '../types';

const ICONS = [
  'MenuBook', 'CheckCircle', 'AccessTime', 'SwapHoriz', 'Science', 'Calculate', 'Language', 'Computer', 'School', 'Star', 'Book', 'Lightbulb', 'QuestionMark',
];

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ id: '', name: '', icon: ICONS[0], subcategories: [] as { id: string; name: string; icon?: string }[] });
  const [subForm, setSubForm] = useState({ id: '', name: '', icon: ICONS[0] });
  const [subEditIdx, setSubEditIdx] = useState<number | null>(null);

  useEffect(() => { fetchCategories().then(setCategories); }, []);

  const resetForm = () => {
    setForm({ id: '', name: '', icon: ICONS[0], subcategories: [] });
    setSubForm({ id: '', name: '', icon: ICONS[0] });
    setSubEditIdx(null);
    setEditCat(null);
  };

  const handleSave = async () => {
    if (!form.id || !form.name) return;
    await setDoc(doc(db, 'categories', form.id), form, { merge: true });
    fetchCategories().then(setCategories);
    setOpen(false); resetForm();
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category and all its subcategories?')) return;
    await deleteDoc(doc(db, 'categories', id));
    fetchCategories().then(setCategories);
  };
  const handleEdit = (cat: Category) => {
    setEditCat(cat);
    setForm({
      ...cat,
      icon: cat.icon || ICONS[0],
      subcategories: (cat.subcategories || []).map(sub => ({
        ...sub,
        icon: sub.icon || ICONS[0],
      })),
    });
    setOpen(true);
  };
  // Subcategory handlers
  const addOrEditSub = () => {
    if (!subForm.id || !subForm.name) return;
    let subs = [...form.subcategories];
    if (subEditIdx !== null) subs[subEditIdx] = { ...subForm };
    else subs.push({ ...subForm });
    setForm(f => ({ ...f, subcategories: subs }));
    setSubForm({ id: '', name: '', icon: ICONS[0] });
    setSubEditIdx(null);
  };
  const handleSubEdit = (idx: number) => {
    setSubEditIdx(idx);
    const sub = form.subcategories[idx];
    setSubForm({
      ...sub,
      icon: sub.icon || ICONS[0],
    });
  };
  const handleSubDelete = (idx: number) => {
    setForm(f => ({ ...f, subcategories: f.subcategories.filter((_, i) => i !== idx) }));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Manage Categories & Subcategories</Typography>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => { resetForm(); setOpen(true); }}>Add Category</Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {categories.map(cat => (
          <Card key={cat.id} sx={{ minWidth: 220 }}>
            <CardContent>
              <Typography variant="subtitle1">{cat.name}</Typography>
              <Typography variant="caption" color="text.secondary">ID: {cat.id}</Typography><br />
              <Typography variant="caption" color="text.secondary">Icon: {cat.icon}</Typography>
              <Box sx={{ mt: 1 }}>
                {cat.subcategories?.map(sub => (
                  <Chip key={sub.id} label={sub.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
            </CardContent>
            <Stack direction="row" spacing={1} sx={{ p: 1 }}>
              <IconButton size="small" color="primary" onClick={() => handleEdit(cat)}><EditIcon /></IconButton>
              <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}><DeleteIcon /></IconButton>
            </Stack>
          </Card>
        ))}
      </Box>
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editCat ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Category ID" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} disabled={!!editCat} />
            <TextField label="Category Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <TextField select label="Icon" title="Icon" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} SelectProps={{ native: true, inputProps: { title: 'Icon' } }}>
              {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
            </TextField>
            <Typography variant="subtitle2">Subcategories</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField label="Subcategory ID" value={subForm.id} onChange={e => setSubForm(f => ({ ...f, id: e.target.value }))} size="small" />
              <TextField label="Subcategory Name" value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} size="small" />
              <TextField select label="Icon" title="Icon" value={subForm.icon} onChange={e => setSubForm(f => ({ ...f, icon: e.target.value }))} size="small" SelectProps={{ native: true, inputProps: { title: 'Icon' } }}>
                {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
              </TextField>
              <Button variant="outlined" onClick={addOrEditSub}>{subEditIdx !== null ? 'Update' : 'Add'}</Button>
            </Stack>
            <Box>
              {form.subcategories.map((sub, idx) => (
                <Chip
                  key={sub.id}
                  label={sub.name + (sub.icon ? ` (${sub.icon})` : '')}
                  onClick={() => handleSubEdit(idx)}
                  onDelete={() => handleSubDelete(idx)}
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editCat ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
