"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  userType: string;
  managedAgencyId?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, name?: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {
    throw new Error("not ready");
  },
  register: async () => {
    throw new Error("not ready");
  },
  logout: () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ps_user");
      const token = localStorage.getItem("ps_token");
      if (stored && token) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  function persist(token: string, u: AuthUser) {
    localStorage.setItem("ps_token", token);
    localStorage.setItem("ps_user", JSON.stringify(u));
    setUser(u);
  }

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    persist(res.token, res.user);
    return res.user as AuthUser;
  };

  const register = async (email: string, password: string, name?: string) => {
    const res = await api.register(email, password, name);
    persist(res.token, res.user);
    return res.user as AuthUser;
  };

  const logout = () => {
    localStorage.removeItem("ps_token");
    localStorage.removeItem("ps_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
