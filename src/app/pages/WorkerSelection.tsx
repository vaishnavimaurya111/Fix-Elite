import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Star, MapPin, Clock, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useApp, Worker, Booking } from "../context/AppContext";
import { motion } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

const mockWorkers: Worker[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    rating: 4.9,
    reviewCount: 234,
    distance: "1.2 km",
    estimatedTime: "15 mins",
    avatar: "https://images.unsplash.com/photo-1586447751596-6c2050a0d335?w=150",
    skills: ["Emergency Repairs", "Certified"],
    completedJobs: 500,
    hourlyRate: 350,
  },
  {
    id: "2",
    name: "Amit Sharma",
    rating: 4.8,
    reviewCount: 189,
    distance: "2.1 km",
    estimatedTime: "20 mins",
    avatar: "https://images.unsplash.com/photo-1774600166432-ba8ac640b318?w=150",
    skills: ["Expert", "5+ years"],
    completedJobs: 420,
    hourlyRate: 400,
  },
  {
    id: "3",
    name: "Vikram Singh",
    rating: 4.7,
    reviewCount: 156,
    distance: "3.5 km",
    estimatedTime: "25 mins",
    avatar: "https://images.unsplash.com/photo-1578935570956-4326d9c62ebc?w=150",
    skills: ["Verified", "Fast Service"],
    completedJobs: 380,
    hourlyRate: 300,
  },
  {
    id: "4",
    name: "Sanjay Patel",
    rating: 4.9,
    reviewCount: 298,
    distance: "1.8 km",
    estimatedTime: "18 mins",
    avatar: "https://images.unsplash.com/photo-1759521296013-559479e2a891?w=150",
    skills: ["Premium", "10+ years"],
    completedJobs: 650,
    hourlyRate: 450,
  },
];

export default function WorkerSelection() {
  const navigate = useNavigate();
  const {
    selectedService,
    problemDescription,
    aiEstimate,
    setSelectedWorker,
    isEmergency,
    scheduledDate,
    addBooking,
    setCurrentBooking,
  } = useApp();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedWorkerData, setSelectedWorkerData] = useState<Worker | null>(null);

  if (!selectedService || !aiEstimate) {
    navigate("/");
    return null;
  }

  const handleWorkerSelect = (worker: Worker) => {
    setSelectedWorkerData(worker);
    setShowConfirmDialog(true);
  };

  const confirmBooking = () => {
    if (!selectedWorkerData) return;

    setSelectedWorker(selectedWorkerData);
    
    const booking: Booking = {
      id: `BK${Date.now()}`,
      service: selectedService.name,
      problem: problemDescription,
      worker: selectedWorkerData,
      estimate: aiEstimate,
      status: "confirmed",
      scheduledFor: scheduledDate || new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    };

    addBooking(booking);
    setCurrentBooking(booking);
    
    toast.success("Booking confirmed!");
    navigate(`/tracking/${booking.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/describe-problem")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-zinc-900 dark:text-white">
                Available Workers
              </h1>
              <p className="text-sm text-zinc-500">{mockWorkers.length} nearby</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Estimated Cost Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Estimated Cost</p>
                <p className="text-2xl font-bold">{aiEstimate.estimatedCost}</p>
              </div>
              {isEmergency && (
                <Badge className="bg-red-600 hover:bg-red-700">
                  EMERGENCY
                </Badge>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Workers List */}
        <div className="space-y-4">
          {mockWorkers.map((worker, index) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-500">
                <div className="flex gap-4">
                  <Avatar className="w-16 h-16 border-2 border-blue-500">
                    <AvatarImage src={worker.avatar} alt={worker.name} />
                    <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                          {worker.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{worker.rating}</span>
                            <span>({worker.reviewCount})</span>
                          </div>
                          <span>•</span>
                          <span>{worker.completedJobs} jobs</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{worker.hourlyRate}/hr
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {worker.distance} away
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {worker.estimatedTime}
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      {worker.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleWorkerSelect(worker)}
                      className="w-full"
                    >
                      Select Worker
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Review your booking details before confirming
            </DialogDescription>
          </DialogHeader>
          
          {selectedWorkerData && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedWorkerData.avatar} />
                  <AvatarFallback>
                    {selectedWorkerData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white">
                    {selectedWorkerData.name}
                  </h4>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedWorkerData.rating}</span>
                    <span className="text-zinc-500">
                      ({selectedWorkerData.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Service</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {selectedService.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Estimated Cost</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {aiEstimate.estimatedCost}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Arrival Time</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    ~{selectedWorkerData.estimatedTime}
                  </span>
                </div>
                {isEmergency && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Priority</span>
                    <Badge variant="destructive" className="h-5">EMERGENCY</Badge>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={confirmBooking}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
