// Clean single Dashboard component
import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { fetchCategories } from '../services/db';
import { useAuth } from '../providers/AuthProvider';
import Shell from '../layout/Shell';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import type { Category } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export default function Dashboard() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [scoreByCategory, setScoreByCategory] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCategories().then(setCategories);
    if (user?.scoreByCategory) setScoreByCategory(user.scoreByCategory);
  }, [user]);

  const data = {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        label: 'Score',
        data: categories.map((c) => scoreByCategory[c.id] || 0),
        backgroundColor: [
          '#60a5fa', '#fbbf24', '#34d399', '#f87171', '#a78bfa', '#f472b6', '#facc15', '#38bdf8', '#f472b6', '#818cf8',
        ],
      },
    ],
  };

  const leftItems = [
    { label: 'Home', href: '#/' },
    { label: 'Dashboard', href: '#/dashboard', icon: <QuizIcon color="primary" /> },
    { label: 'Practice', href: '#/practice', icon: <SchoolIcon color="primary" /> },
    { label: 'Quiz', href: '#/quiz', icon: <QuizIcon color="secondary" /> },
    { label: 'Favorites', href: '#/favorites' },
    { label: 'Submit MCQs', href: '#/submit' },
    { label: 'About Us', href: '#/about' },
    { label: 'Contact Us', href: '#/contact' },
  ];

  return (
    <Shell leftItems={leftItems}>
      {/* <Box sx={{ p: 2, mb: 2, bgcolor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 2, fontSize: 15, fontWeight: 600 }}>
        Dashboard loaded
      </Box> */}

          
      {/* Debug: show data on page for troubleshooting */}
      {/* <Box sx={{ p: 2, mb: 2, bgcolor: '#fffbe6', color: '#b45309', border: '1px solid #fde68a', borderRadius: 2, fontSize: 13 }}>
        <div><b>categories:</b> {JSON.stringify(categories)}</div>
        <div><b>scoreByCategory:</b> {JSON.stringify(scoreByCategory)}</div>
        <div><b>user:</b> {JSON.stringify(user)}</div>
      </Box> */}
      {(!categories || categories.length === 0) && (
        <Box sx={{ color: 'red', mb: 2 }}>No categories found. Please add categories in your database.</Box>
      )}
      {!user && (
        <Box sx={{ color: 'red', mb: 2 }}>No user found. Please log in.</Box>
      )}
      {categories && categories.length > 0 && user && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>User Dashboard</Typography>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Category-wise Progress</Typography>
              <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                <Bar data={data} />
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6">Category Distribution</Typography>
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <Pie data={data} />
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Shell>
  );
}