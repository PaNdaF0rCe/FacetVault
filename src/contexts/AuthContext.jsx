import { createContext, useContext, useEffect, useState } from "react";
import { ADMIN_UID } from "../config/appConfig";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../lib/firebase/config";

const AuthContext = createContext(null);
const provider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("Failed to set auth persistence:", error);
      }

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!mounted) return;
        setUser(firebaseUser ?? null);
      });

      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Google redirect login success:", result.user.email);
        }
      } catch (error) {
        console.error("Google redirect result error:", error);
      } finally {
        if (mounted && auth.currentUser === null) {
          setUser(null);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      unsubscribe();
    };
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
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent
    );
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    await setPersistence(auth, browserLocalPersistence);

    if (isMobile && !isLocalhost) {
      await signInWithRedirect(auth, provider);
      return null;
    }

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