import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);      // { id, email, role, name, doctor_profile }
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get("/user/me");
      setProfile(res.data);
      return res.data;
    } catch (e) {
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [loadProfile]);

  const signOut = async () => {
    await fbSignOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, loading, signOut, reloadProfile: loadProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
