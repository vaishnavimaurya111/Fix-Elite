import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as orderService from "../../services/order.service";
import { useAuth } from "./AuthContext";

export interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Worker {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: string;
  estimatedTime: string;
  avatar: string;
  skills: string[];
  completedJobs: number;
  hourlyRate: number;
}

export interface AIEstimate {
  problemType: string;
  suggestedService: string;
  estimatedCost: string;
  urgency: "low" | "medium" | "high";
  description: string;
  tips: string[];
  extractedLocation?: string | null;
}

export interface Booking {
  id: string;
  service: string;
  problem: string;
  worker: Worker;
  estimate: AIEstimate;
  status: "pending" | "confirmed" | "in-progress" | "completed";
  scheduledFor?: Date;
  createdAt: Date;
  totalCost?: number;
}

interface AppContextType {
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  problemDescription: string;
  setProblemDescription: (description: string) => void;
  problemImage: string | null;
  setProblemImage: (image: string | null) => void;
  aiEstimate: AIEstimate | null;
  setAiEstimate: (estimate: AIEstimate | null) => void;
  selectedWorker: Worker | null;
  setSelectedWorker: (worker: Worker | null) => void;
  isEmergency: boolean;
  setIsEmergency: (emergency: boolean) => void;
  scheduledDate: Date | null;
  setScheduledDate: (date: Date | null) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  currentBooking: Booking | null;
  setCurrentBooking: (booking: Booking | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [problemDescription, setProblemDescription] = useState("");
  const [problemImage, setProblemImage] = useState<string | null>(null);
  const [aiEstimate, setAiEstimate] = useState<AIEstimate | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  
  const { isAuthenticated } = useAuth();

  // Fetch orders from backend when authenticated
  useEffect(() => {
    const fetchOrders = async () => {
      if (isAuthenticated) {
        try {
          const res = await orderService.getMyOrders();
          if (res.success && res.data) {
             // Map backend orders to frontend bookings format if needed
             // For now, we'll cast it to keep it simple, though the schema differs slightly
             setBookings(res.data as any[]);
          }
        } catch (error) {
          console.error("Failed to fetch orders", error);
        }
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  const addBooking = async (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        selectedService,
        setSelectedService,
        problemDescription,
        setProblemDescription,
        problemImage,
        setProblemImage,
        aiEstimate,
        setAiEstimate,
        selectedWorker,
        setSelectedWorker,
        isEmergency,
        setIsEmergency,
        scheduledDate,
        setScheduledDate,
        bookings,
        addBooking,
        currentBooking,
        setCurrentBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
