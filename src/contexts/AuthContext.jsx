import { createContext, useContext, useEffect, useState } from "react";
import { ADMIN_UID } from "../config/appConfig";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../lib/firebase/config";

const AuthContext = createContext(null);
const provider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    return cred;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    await setPersistence(auth, browserLocalPersistence);
    return signInWithPopup(auth, provider);
  };

  const isAdmin = !!user && user.uid === ADMIN_UID;

  const value = {
    user,
    loading: user === undefined,
    login,
    signup,
    logout,
    loginWithGoogle,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}