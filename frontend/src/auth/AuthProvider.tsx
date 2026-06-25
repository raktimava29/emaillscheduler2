import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/users";

const API_BASE = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      setUser(null);
      throw new Error("Not authenticated");
    }

    setUser(await res.json());
  };

  useEffect(() => {
    refreshUser()
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
