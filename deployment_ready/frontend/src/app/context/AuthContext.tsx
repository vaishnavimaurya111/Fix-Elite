import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as authService from "../../services/auth.service";

export type UserRole = "customer" | "plumber" | "electrician" | "ac-repair" | "carpenter" | "painter" | "cleaning";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  rating?: number;
  completedJobs?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("fixnow_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const data = await authService.login(email, password);
      // data should contain { success: true, token: string, user: User }
      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("fixnow_user", JSON.stringify(data.user));
        localStorage.setItem("fixnow_token", data.token);
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, phone: string, role: UserRole) => {
    try {
      const data = await authService.register(name, email, password, role);
      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("fixnow_user", JSON.stringify(data.user));
        localStorage.setItem("fixnow_token", data.token);
      }
    } catch (error) {
      console.error("Signup failed", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("fixnow_user");
    localStorage.removeItem("fixnow_token");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
