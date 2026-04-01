import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Phone, MessageSquare, MapPin, Clock, CheckCircle2, Navigation, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { Badge } from "../components/ui/badge";

export default function Tracking() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { currentBooking, selectedWorker } = useApp();
  const [workerProgress, setWorkerProgress] = useState(0);
  const [status, setStatus] = useState<"confirmed" | "on-way" | "arrived" | "in-progress">("confirmed");
  const [estimatedArrival, setEstimatedArrival] = useState(15);

  useEffect(() => {
    if (!currentBooking || !selectedWorker) {
      navigate("/");
      return;
    }

    // Simulate worker movement
    const progressInterval = setInterval(() => {
      setWorkerProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 1000);

    // Update status based on progress
    const statusInterval = setInterval(() => {
      setWorkerProgress((current) => {
        if (current >= 100) {
          setStatus("arrived");
          setTimeout(() => {
            setStatus("in-progress");
            setTimeout(() => {
              navigate(`/invoice/${bookingId}`);
            }, 5000);
          }, 3000);
        } else if (current >= 50) {
          setStatus("on-way");
        }
        return current;
      });
    }, 1000);

    // Countdown timer
    const timerInterval = setInterval(() => {
      setEstimatedArrival((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      clearInterval(timerInterval);
    };
  }, [currentBooking, selectedWorker, bookingId, navigate]);

  if (!currentBooking || !selectedWorker) {
    return null;
  }

  const statusConfig = {
    confirmed: { text: "Booking Confirmed", color: "text-blue-600 dark:text-blue-400" },
    "on-way": { text: "Worker is on the way", color: "text-orange-600 dark:text-orange-400" },
    arrived: { text: "Worker has arrived", color: "text-green-600 dark:text-green-400" },
    "in-progress": { text: "Work in progress", color: "text-purple-600 dark:text-purple-400" },
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-zinc-900 dark:text-white">
              Track Your Worker
            </h1>
            <p className="text-sm text-zinc-500">Booking ID: {currentBooking.id}</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Map Simulation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="overflow-hidden">
            <div className="relative h-80 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950">
              {/* Simulated Map */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: workerProgress > 50 ? 45 : 0,
                    }}
                    transition={{
                      y: { repeat: Infinity, duration: 2 },
                      rotate: { duration: 0.5 },
                    }}
                    className="inline-block"
                  >
                    <div className="bg-blue-600 p-4 rounded-full shadow-lg">
                      <Navigation className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-6 py-3 rounded-full">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Distance</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white">
                      {(selectedWorker.distance.split(" ")[0] as any * (1 - workerProgress / 100)).toFixed(1)} km away
                    </p>
                  </div>
                </div>
              </div>

              {/* Corner badges */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-green-600 hover:bg-green-700">
                  <MapPin className="w-3 h-3 mr-1" />
                  Live Tracking
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  ETA: {estimatedArrival} min
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-4 bg-white dark:bg-zinc-900">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${statusConfig[status].color}`}>
                  {statusConfig[status].text}
                </span>
                <span className="text-sm text-zinc-500">{workerProgress.toFixed(0)}%</span>
              </div>
              <Progress value={workerProgress} className="h-2" />
            </div>
          </Card>
        </motion.div>

        {/* Worker Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16 border-2 border-blue-500">
                <AvatarImage src={selectedWorker.avatar} />
                <AvatarFallback>{selectedWorker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                  {selectedWorker.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {currentBooking.service} • ⭐ {selectedWorker.rating}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Vehicle Number</p>
                <p className="font-semibold text-zinc-900 dark:text-white">MH 02 AB 1234</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Estimated Cost</p>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {currentBooking.estimate.estimatedCost}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-zinc-900 dark:text-white">
              Booking Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Problem Type</span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {currentBooking.estimate.problemType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Urgency</span>
                <Badge
                  variant={
                    currentBooking.estimate.urgency === "high"
                      ? "destructive"
                      : "default"
                  }
                >
                  {currentBooking.estimate.urgency.toUpperCase()}
                </Badge>
              </div>
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Description</p>
                <p className="text-sm text-zinc-900 dark:text-white">
                  {currentBooking.problem}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-zinc-900 dark:text-white">
              Progress Timeline
            </h3>
            <div className="space-y-4">
              {[
                { label: "Booking Confirmed", completed: true },
                { label: "Worker Assigned", completed: true },
                { label: "On the Way", completed: workerProgress >= 50 },
                { label: "Arrived", completed: workerProgress >= 100 },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed
                        ? "bg-green-600"
                        : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <div className="w-3 h-3 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      step.completed
                        ? "text-zinc-900 dark:text-white font-medium"
                        : "text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
