import { useNavigate } from "react-router";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";

export default function BookingHistory() {
  const navigate = useNavigate();
  const { bookings } = useApp();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100 dark:bg-green-950" };
      case "in-progress":
        return { icon: Clock, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950" };
      case "confirmed":
        return { icon: Clock, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-950" };
      default:
        return { icon: AlertCircle, color: "text-zinc-600", bg: "bg-zinc-100 dark:bg-zinc-800" };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-zinc-900 dark:text-white">
                Booking History
              </h1>
              <p className="text-sm text-zinc-500">
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-zinc-100 dark:bg-zinc-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">
              No bookings yet
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Start by booking your first service
            </p>
            <Button onClick={() => navigate("/")}>
              Browse Services
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 border-2 border-blue-500">
                        <AvatarImage src={booking.worker.avatar} />
                        <AvatarFallback>
                          {booking.worker.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-white">
                              {booking.service}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {booking.worker.name}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={statusConfig.bg}
                          >
                            <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.color}`} />
                            <span className={statusConfig.color}>
                              {booking.status}
                            </span>
                          </Badge>
                        </div>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                          {booking.problem}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500">
                            {booking.createdAt.toLocaleDateString()}
                          </span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {booking.estimate.estimatedCost}
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              if (booking.status === "completed") {
                                navigate(`/invoice/${booking.id}`);
                              } else {
                                navigate(`/tracking/${booking.id}`);
                              }
                            }}
                          >
                            {booking.status === "completed" ? "View Invoice" : "Track Booking"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
