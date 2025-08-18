export interface UIContextType {
  mode: 'light' | 'dark'
  setMode: (mode: 'light' | 'dark') => void
  fontSize: FontSizeOption
  setFontSize: (size: FontSizeOption) => void
  showAnswers: boolean
  setShowAnswers: (show: boolean) => void
  lastSyncedAt: number | null
}

export type FontSizeOption = 'sm' | 'md' | 'lg' | 'xl'

export interface UserProfile {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  scoreByCategory?: Record<string, number>
  answeredMCQs?: Record<string, boolean> // Track which MCQs user has answered correctly
  isAdmin?: boolean
}

export interface Category {
  id: string
  name: string
  icon?: string
  imageUrl?: string
  subcategories?: { id: string; name: string; icon?: string }[]
}

export interface MCQ {
  id: string
  question: string
  options: string[]
  answerIndex: number
  explanation?: string
  categoryId: string
  createdByUid?: string
  createdByDisplayName?: string
  approved?: boolean
  subcategoryId?: string
}

export interface Comment {
  id: string
  mcqId: string
  uid: string
  text: string
  createdAt: number
  displayName?: string | null
}

export interface QuizAttempt {
  id: string
  uid: string
  categoryId: string
  correct: number
  total: number
  startedAt: number
  finishedAt?: number
}


