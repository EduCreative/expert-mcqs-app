import { onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, setAuthPersistence } from '../firebase'
import type { UserProfile } from '../types'
import { getUserProfile, upsertUserProfile } from '../services/db'

type AuthUser = (UserProfile & { isAnonymous?: boolean }) | null

interface AuthContextValue {
  user: AuthUser
  initializing: boolean
  loginWithGoogle: () => Promise<void>
  loginAnonymously: () => Promise<void>
  loginWithPhone: (phone: string, appVerifier: RecaptchaVerifier) => Promise<any>
  confirmPhoneCode: (confirmationResult: any, code: string) => Promise<void>
  loginWithEmail: (email: string, password: string, remember?: boolean) => Promise<void>
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [initializing, setInitializing] = useState(true)

  // Always fetch latest user profile from Firestore after login and on refresh
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setInitializing(false);
        return;
      }
      try {
        // Always get latest profile from Firestore (including isAdmin)
        const merged = await getUserProfile(u.uid);
        if (merged) {
          setUser({ ...merged, isAnonymous: u.isAnonymous });
        } else {
          // If not found, create and use base profile
          const baseProfile: UserProfile = {
            uid: u.uid,
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
          };
          await upsertUserProfile(baseProfile);
          setUser({ ...baseProfile, isAnonymous: u.isAnonymous });
        }
      } catch {
        // Fall back to auth profile if Firestore is restricted
        setUser({
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          isAnonymous: u.isAnonymous,
        });
      } finally {
        setInitializing(false);
      }
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      async loginWithGoogle() {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
      },
      async loginAnonymously() {
        await signInAnonymously(auth)
      },
      async loginWithPhone(phone, appVerifier) {
        return signInWithPhoneNumber(auth, phone, appVerifier)
      },
      async confirmPhoneCode(confirmationResult, code) {
        await confirmationResult.confirm(code)
      },
      async loginWithEmail(email, password, remember = true) {
        await setAuthPersistence(remember)
        await signInWithEmailAndPassword(auth, email, password)
      },
      async registerWithEmail(name, email, password) {
        await createUserWithEmailAndPassword(auth, email, password)
        if (auth.currentUser) {
          // Ensure profile saved and displayName is set
          if (name) await updateProfile(auth.currentUser, { displayName: name })
          const profile: UserProfile = {
            uid: auth.currentUser.uid,
            displayName: name || auth.currentUser.displayName,
            email: auth.currentUser.email,
            photoURL: auth.currentUser.photoURL,
          }
          await upsertUserProfile(profile)
        }
      },
      async resetPassword(email) {
        await sendPasswordResetEmail(auth, email)
      },
      async logout() {
        await signOut(auth)
      },
      async refreshUser() {
        if (auth.currentUser) {
          const merged = await getUserProfile(auth.currentUser.uid)
          if (merged) {
            setUser({ ...merged, isAnonymous: auth.currentUser.isAnonymous })
          }
        }
      },
    }),
    [user, initializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


