// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Card, CardContent, Typography, Box, MenuItem, Select, FormControl, InputLabel, Grid, Divider
} from '@mui/material';
import {
  Pie, Bar, Line, Radar
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { fetchCategories, fetchMCQs } from '../services/db';
import { useAuth } from '../providers/AuthProvider';
import Shell from '../layout/Shell';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCardIcon from '@mui/icons-material/AddCard';
import InfoIcon from '@mui/icons-material/Info';
import ContactPageIcon from '@mui/icons-material/ContactPage';

import type { Category, MCQ } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale, // needed for Radar chart
  Tooltip,
  Legend,
  Title
);

type AttemptStat = {
  categoryId: string;
  categoryName: string;
  attempted: number;
  notAttempted: number;
  total: number;
  percentAttempted: number; // 0..100
};

export default function Dashboard() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [chartType, setChartType] = useState<'Bar' | 'Line' | 'Pie' | 'Radar'>('Bar');

  // use scoreByCategory as primary source for counts (it's the reliable field)
  const scoreByCategory = (user?.scoreByCategory ?? {}) as Record<string, number>;
  // answered map exists but may be partial/older format
  const answeredMap = (user?.answeredMCQs ?? {}) as Record<string, boolean>;
  const answeredSet = useMemo(() => new Set(Object.keys(answeredMap).filter(k => answeredMap[k])), [answeredMap]);

  useEffect(() => {
    // load categories + all approved mcqs
    fetchCategories().then(setCategories).catch(() => setCategories([]));
    fetchMCQs().then(setMcqs).catch(() => setMcqs([]));
  }, []);

  // Build attempt stats per category
  const attemptStats: AttemptStat[] = useMemo(() => {
    if (!categories.length) return [];
    // group mcqs by categoryId
    const byCat: Record<string, MCQ[]> = {};
    mcqs.forEach((m) => {
      const catId = (m as any).categoryId || (m as any).category; // be defensive
      if (!catId) return;
      (byCat[catId] ||= []).push(m);
    });

    return categories.map((c) => {
      const list = byCat[c.id] || [];
      // <-- SAFE FIX: prefer scoreByCategory (counts already maintained in your DB),
      // fallback to per-mcq answeredMap if scoreByCategory not present for this category.
      const attemptedFromScore = typeof scoreByCategory[c.id] === 'number' ? scoreByCategory[c.id] : null;
      const attemptedFromAnsweredSet = list.reduce((acc, m) => acc + (answeredSet.has(m.id) ? 1 : 0), 0);
      const attempted = attemptedFromScore !== null ? attemptedFromScore : attemptedFromAnsweredSet;
      const total = list.length;
      const notAttempted = Math.max(0, total - attempted);
      const percentAttempted = total ? +(attempted * 100 / total).toFixed(1) : 0;
      return {
        categoryId: c.id,
        categoryName: c.name,
        attempted,
        notAttempted,
        total,
        percentAttempted
      };
    });
  }, [categories, mcqs, answeredSet, scoreByCategory]);

  // Totals for overall pie
  const totalAttempted = attemptStats.reduce((s, r) => s + r.attempted, 0);
  const totalNotAttempted = attemptStats.reduce((s, r) => s + r.notAttempted, 0);

  // Colors
  const attemptedColor = '#34d399';
  const notAttemptedColor = '#f87171';
  const palette = ['#60a5fa', '#fbbf24', '#34d399', '#f87171', '#a78bfa', '#f472b6', '#facc15', '#38bdf8', '#818cf8', '#22d3ee'];

  // ---- Datasets ----

  // Section 2a: Overall attempts pie
  const overallPieData = {
    labels: ['Attempted', 'Not Attempted'],
    datasets: [
      {
        data: [totalAttempted, totalNotAttempted],
        backgroundColor: [attemptedColor, notAttemptedColor]
      }
    ]
  };
  const pieOptions: any = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const value = ctx.parsed;
            const total = totalAttempted + totalNotAttempted || 1;
            const pct = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${value} (${pct}%)`;
          }
        }
      },
      legend: { position: 'bottom' },
      title: { display: false }
    }
  };

  // Section 2b: Stacked bar (Attempted vs Not Attempted per category)
  const attemptsBarData = {
    labels: attemptStats.map(s => s.categoryName),
    datasets: [
      { label: 'Attempted', data: attemptStats.map(s => s.attempted), backgroundColor: attemptedColor, stack: 'attempts' },
      { label: 'Not Attempted', data: attemptStats.map(s => s.notAttempted), backgroundColor: notAttemptedColor, stack: 'attempts' }
    ]
  };
  const attemptsBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = (ctx.parsed && (ctx.parsed.y ?? ctx.parsed)) || 0;
            const catTotal = attemptStats[ctx.dataIndex]?.total || 1;
            const pct = ((val / catTotal) * 100).toFixed(1);
            return `${ctx.dataset.label}: ${val} (${pct}%)`;
          }
        }
      },
      legend: { position: 'bottom' },
      title: { display: false }
    }
  };

  // Section 3: Progress by Category (Score + % Attempted)
  const progressLabels = categories.map(c => c.name);
  const scoreSeries = categories.map(c => scoreByCategory[c.id] || 0);
  const pctAttemptedSeries = attemptStats.map(s => s.percentAttempted);

  const progressDatasetCommon = {
    labels: progressLabels,
    datasets: [
      {
        label: 'Score',
        data: scoreSeries,
        backgroundColor: '#60a5fa',
        borderColor: '#60a5fa',
        borderWidth: 2,
        yAxisID: 'y'
      },
      {
        label: '% Attempted',
        data: pctAttemptedSeries,
        backgroundColor: '#a78bfa',
        borderColor: '#a78bfa',
        borderWidth: 2,
        yAxisID: 'y1'
      }
    ]
  };

  const progressBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: { callback: (v: any) => `${v}%` }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.dataset.label || '';
            const val = ctx.parsed.y ?? ctx.parsed;
            return label === '% Attempted' ? `${label}: ${val}%` : `${label}: ${val}`;
          }
        }
      },
      legend: { position: 'bottom' },
      title: { display: false }
    }
  };

  const progressLineOptions = { ...progressBarOptions };

  // New: Pie data for progressDatasetCommon (score distribution across categories)
  const pieProgressData = {
    labels: progressLabels,
    datasets: [{
      data: scoreSeries,
      backgroundColor: progressLabels.map((_, i) => palette[i % palette.length])
    }]
  };
  const pieProgressOptions: any = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed;
            const total = scoreSeries.reduce((a, b) => a + b, 0) || 1;
            const pct = ((val / total) * 100).toFixed(1);
            return `${ctx.label}: ${val} (${pct}%)`;
          }
        }
      },
      legend: { position: 'bottom' }
    }
  };

  // Radar data
  const radarData = {
    labels: progressLabels,
    datasets: [
      {
        label: 'Score',
        data: scoreSeries,
        backgroundColor: 'rgba(96,165,250,0.25)',
        borderColor: '#60a5fa',
        pointBackgroundColor: '#60a5fa'
      },
      {
        label: '% Attempted',
        data: pctAttemptedSeries,
        backgroundColor: 'rgba(167,139,250,0.25)',
        borderColor: '#a78bfa',
        pointBackgroundColor: '#a78bfa'
      }
    ]
  };
  const radarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: Math.max(100, ...pctAttemptedSeries, ...scoreSeries.map(v => Number(v))) // choose a sensible max
      }
    },
    plugins: { legend: { position: 'bottom' } }
  };

  // left menu (unchanged)
  const leftItems = [
    { label: 'Home', href: '#/', icon: <HomeIcon color="primary" /> },
    { label: 'Dashboard', href: '#/dashboard', icon: <DashboardIcon color="primary" /> },
    { label: 'Practice', href: '#/practice', icon: <SchoolIcon color="primary" /> },
    { label: 'Quiz', href: '#/quiz', icon: <QuizIcon color="secondary" /> },
    { label: 'Favorites', href: '#/favorites', icon: <FavoriteIcon color="primary" /> },
    { label: 'Submit MCQs', href: '#/submit', icon: <AddCardIcon color="primary" /> },
    { label: 'About Us', href: '#/about', icon: <InfoIcon color="primary" /> },
    { label: 'Contact Us', href: '#/contact', icon: <ContactPageIcon color="primary" /> },
  ];

  const hasData = categories.length > 0 && mcqs.length > 0;

  // Debug (toggle on by setting localStorage.debugDashboard = '1')
  const debugEnabled = typeof window !== 'undefined' && localStorage.getItem('debugDashboard') === '1';
  const sampleAnsweredIds = Object.keys(answeredMap || {}).slice(0, 12);

  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>User Dashboard</Typography>

      {!user && (
        <Box sx={{ color: 'red', mb: 2 }}>No user found. Please log in.</Box>
      )}
      {user && !hasData && (
        <Box sx={{ color: 'text.secondary', mb: 2 }}>Loading your progress…</Box>
      )}

      {user && hasData && (
        <>
          {/* SECTION 1 — Attempt Summary (text cards) */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Attempt Summary by Category</Typography>
              <Grid container spacing={2}>
                {attemptStats.map((s) => (
                  <Grid size={{ xs: 12, md: 4 }} key={s.categoryId}>
                    <Box sx={{ p: 2, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {s.categoryName}
                      </Typography>
                      <Typography variant="body2">
                        Attempted: <b style={{ color: '#15803d' }}>{s.attempted}</b>
                      </Typography>
                      <Typography variant="body2">
                        Not Attempted: <b style={{ color: '#b91c1c' }}>{s.notAttempted}</b>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total: {s.total} • {s.percentAttempted}% completed
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* SECTION 2 — Attempts Visuals */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Overall Attempts Pie */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>Overall Attempts</Typography>
                  <Box sx={{ height: 300 }}>
                    <Pie data={overallPieData} options={pieOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Per-Category Stacked Bar */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>Attempted vs Not Attempted (by Category)</Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={attemptsBarData} options={attemptsBarOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* SECTION 3 — Progress by Category with chart type selector */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h6">Category-wise Progress</Typography>
                <Divider flexItem orientation="vertical" />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    label="Chart Type"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                  >
                    <MenuItem value="Bar">Bar</MenuItem>
                    <MenuItem value="Line">Line</MenuItem>
                    <MenuItem value="Pie">Pie</MenuItem>
                    <MenuItem value="Radar">Radar</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Blue = Score, Purple = % Attempted (right axis).
              </Typography>
              <Box sx={{ height: 340 }}>
                {chartType === 'Bar' && (
                  <Bar data={progressDatasetCommon} options={progressBarOptions} />
                )}
                {chartType === 'Line' && (
                  <Line data={progressDatasetCommon} options={progressLineOptions} />
                )}
                {chartType === 'Pie' && (
                  <Box sx={{ height: '100%' }}>
                    <Pie data={pieProgressData} options={pieProgressOptions} />
                  </Box>
                )}
                {chartType === 'Radar' && (
                  <Box sx={{ height: '100%' }}>
                    <Radar data={radarData} options={radarOptions} />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Debug block (enable by running in console: localStorage.setItem('debugDashboard','1') ) */}
          {debugEnabled && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">Debug — answeredMCQs</Typography>
                <Typography variant="body2">answeredMCQs keys count: {Object.keys(answeredMap || {}).length}</Typography>
                <Typography variant="body2">sample IDs: {sampleAnsweredIds.join(', ')}</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Note: this debug is intentionally visible only when you enable it via localStorage.
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Shell>
  );
}
