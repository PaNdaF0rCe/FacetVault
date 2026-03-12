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
    let unsubscribe = () => {};

    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        await getRedirectResult(auth).catch(() => null);
      } catch (error) {
        console.error('Auth init error:', error);
      }

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser || null);
        setLoading(false);
      });
    };

    initAuth();

    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const loginWithGoogle = async () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    return signInWithPopup(auth, provider);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        loginWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}