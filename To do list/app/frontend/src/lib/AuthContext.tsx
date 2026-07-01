import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ProfileApi, type Profile } from "@/lib/api";

const TOKEN_KEY = "authToken";

interface AuthContextValue {
  isAuthenticated: boolean;
  profile: Profile | null;
  login: (token: string) => void;
  logout: () => void;
  setProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }
    ProfileApi.get()
      .then(setProfile)
      .catch((err) => console.error("Failed to load profile", err));
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: token !== null,
      profile,
      login: (newToken: string) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      },
      setProfile,
    }),
    [token, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
