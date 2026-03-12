import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../lib/firebase/config';

const AuthContext = createContext(null);

const provider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        await getRedirectResult(auth).catch(() => null);
      } catch {
        // ignore here; auth observer below is source of truth
      }

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!mounted) return;
        setUser(firebaseUser || null);
        setLoading(false);
      });

      return unsubscribe;
    };

    let unsubscribe;
    initAuth().then((fn) => {
      unsubscribe = fn;
    });

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred;
  };

  const logout = () => signOut(auth);

  const loginWithGoogle = async () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      await signInWithRedirect(auth, provider);
      return;
    }

    return signInWithPopup(auth, provider);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}