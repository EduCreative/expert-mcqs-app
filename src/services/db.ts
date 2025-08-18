
// Admin comment moderation helpers
export async function approveComment(commentId: string) {
  await updateDoc(doc(db, 'comments', commentId), { approved: true });
}

export async function revokeComment(commentId: string) {
  await updateDoc(doc(db, 'comments', commentId), { approved: false });
}

export async function editComment(commentId: string, text: string) {
  await updateDoc(doc(db, 'comments', commentId), { text });
}

// Fetch all comments for admin (not filtered by approved)
export async function fetchCommentsForAdmin(): Promise<Comment[]> {
  const snap = await getDocs(collection(db, 'comments'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function fetchCategories(): Promise<Category[]> {
  const q = query(collection(db, 'categories'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function fetchMCQsByCategorySequential(
  categoryId: string,
  limitCount = 100,
): Promise<MCQ[]> {
  const q = query(
    collection(db, 'mcqs'),
    where('categoryId', '==', categoryId),
    where('approved', '==', true),
    limit(limitCount),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function addUserComment(
  mcqId: string,
  uid: string,
  text: string,
  displayName?: string | null,
) {
  await addDoc(collection(db, 'comments'), {
    mcqId,
    uid,
    text,
    displayName: displayName ?? null,
    createdAt: Date.now(),
    approved: false,
  })
}

export async function fetchComments(mcqId: string): Promise<Comment[]> {
  // Remove limit to fetch all approved comments for the MCQ
  const q = query(
    collection(db, 'comments'),
    where('mcqId', '==', mcqId),
    where('approved', '==', true),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function submitMCQ(mcq: Omit<MCQ, 'id' | 'approved'>, createdByDisplayName?: string) {
  await addDoc(collection(db, 'mcqs'), { 
    ...mcq, 
    approved: false,
    createdByDisplayName: createdByDisplayName || 'Admin'
  })
}

export async function upsertUserProfile(profile: UserProfile) {
  await setDoc(doc(db, 'users', profile.uid), profile, { merge: true })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? { uid, ...(snap.data() as any) } : null
}

export async function approveMCQ(mcqId: string) {
  await updateDoc(doc(db, 'mcqs', mcqId), { approved: true })
}

// User scoring helpers
export async function incrementUserScore(uid: string, categoryId: string, delta: number, mcqId: string) {
  try {
    const ref = doc(db, 'users', uid)
    await updateDoc(ref, { 
      [`scoreByCategory.${categoryId}`]: increment(delta),
      [`answeredMCQs.${mcqId}`]: true
    })
  } catch (error) {
    console.warn('Failed to increment score in Firestore:', error)
    // Fallback: try to get current profile and update with merge
    try {
      const currentProfile = await getUserProfile(uid)
      const currentScores = currentProfile?.scoreByCategory || {}
      const currentAnswered = currentProfile?.answeredMCQs || {}
      const newScores = {
        ...currentScores,
        [categoryId]: (currentScores[categoryId] || 0) + delta
      }
      const newAnswered = {
        ...currentAnswered,
        [mcqId]: true
      }
      await upsertUserProfile({
        uid,
        displayName: currentProfile?.displayName || null,
        email: currentProfile?.email || null,
        photoURL: currentProfile?.photoURL || null,
        scoreByCategory: newScores,
        answeredMCQs: newAnswered
      })
    } catch (fallbackError) {
      console.error('Fallback score update also failed:', fallbackError)
      // Store score locally as last resort
      const localScores = JSON.parse(localStorage.getItem('localScores') || '{}')
      const localAnswered = JSON.parse(localStorage.getItem('localAnswered') || '{}')
      localScores[categoryId] = (localScores[categoryId] || 0) + delta
      localAnswered[mcqId] = true
      localStorage.setItem('localScores', JSON.stringify(localScores))
      localStorage.setItem('localAnswered', JSON.stringify(localAnswered))
    }
  }
}

// Check if user has already answered an MCQ correctly
export async function hasUserAnsweredMCQ(uid: string, mcqId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(uid)
    if (profile?.answeredMCQs?.[mcqId]) {
      return true
    }
    // Check local storage as fallback
    const localAnswered = JSON.parse(localStorage.getItem('localAnswered') || '{}')
    return localAnswered[mcqId] === true
  } catch (error) {
    console.warn('Failed to check answered MCQs:', error)
    // Check local storage as fallback
    const localAnswered = JSON.parse(localStorage.getItem('localAnswered') || '{}')
    return localAnswered[mcqId] === true
  }
}

// Favorites helpers - stored under users/{uid}/favorites/{mcqId}
export async function addFavorite(uid: string, mcqId: string) {
  await setDoc(doc(db, 'users', uid, 'favorites', mcqId), { mcqId, addedAt: Date.now() })
}

export async function removeFavorite(uid: string, mcqId: string) {
  await updateDoc(doc(db, 'users', uid, 'favorites', mcqId), { removed: true })
}

export async function fetchFavoriteMcqIds(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'favorites'))
  return snap.docs.filter((d) => !(d.data() as any).removed).map((d) => d.id)
}

export async function fetchMCQsByIds(ids: string[]): Promise<MCQ[]> {
  const results: MCQ[] = []
  for (const id of ids) {
    const s = await getDoc(doc(db, 'mcqs', id))
    if (s.exists()) results.push({ id: s.id, ...(s.data() as any) })
  }
  return results
}

// Admin helpers
export async function fetchPendingMCQs(limitCount = 100): Promise<MCQ[]> {
  const q = query(collection(db, 'mcqs'), where('approved', '==', false), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function fetchUsers(limitCount = 200): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, 'users'), limit(limitCount)))
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) }))
}


// Firestore imports
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { MCQ, Category, UserProfile, Comment } from '../types';


