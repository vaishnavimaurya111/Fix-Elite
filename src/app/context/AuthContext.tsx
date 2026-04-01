import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock user data
    const mockUser: User = {
      id: `user_${Date.now()}`,
      name: role === "customer" ? "John Doe" : "Professional Worker",
      email,
      phone: "+91 9876543210",
      role,
      avatar: role === "customer" 
        ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
        : "https://images.unsplash.com/photo-1586447751596-6c2050a0d335?w=150",
      rating: role !== "customer" ? 4.8 : undefined,
      completedJobs: role !== "customer" ? 250 : undefined,
    };

    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem("fixnow_user", JSON.stringify(mockUser));
  };

  const signup = async (name: string, email: string, password: string, phone: string, role: UserRole) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone,
      role,
      avatar: role === "customer" 
        ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
        : "https://images.unsplash.com/photo-1586447751596-6c2050a0d335?w=150",
      rating: role !== "customer" ? 5.0 : undefined,
      completedJobs: role !== "customer" ? 0 : undefined,
    };

    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("fixnow_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("fixnow_user");
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
