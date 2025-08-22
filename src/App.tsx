import { UIProvider } from './providers/UIProvider';
import { Component } from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './providers/AuthProvider';

// Simple error boundary for debugging blank screens
class ErrorBoundary extends Component<{ children: ReactNode }, { error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <div style={{ color: 'red', padding: 32 }}>
        <h2>Something went wrong</h2>
        <pre>{String(this.state.error)}</pre>
      </div>;
    }
    return this.props.children;
  }
}
import { HashRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Quiz from './pages/Quiz'
import AuthPage from './pages/Auth'
import AdminPage from './pages/Admin'
import Favorites from './pages/Favorites'
import Submit from './pages/Submit'
import About from './pages/About'
import Contact from './pages/Contact'

import Dashboard from './pages/Dashboard'

function App() {
  return (
    <ErrorBoundary>
      <UIProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </UIProvider>
    </ErrorBoundary>
  )
}

export default App
