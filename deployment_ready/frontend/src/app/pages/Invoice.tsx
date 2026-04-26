import { useNavigate, useParams } from "react-router";
import { CheckCircle2, Download, Share2, Home, Receipt, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";

export default function Invoice() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { currentBooking, selectedWorker } = useApp();

  if (!currentBooking || !selectedWorker) {
    navigate("/");
    return null;
  }

  // Calculate final costs
  const baseCost = 450;
  const materialCost = 150;
  const gst = (baseCost + materialCost) * 0.18;
  const totalCost = baseCost + materialCost + gst;

  const handleDownload = () => {
    toast.success("Invoice downloaded successfully");
  };

  const handleShare = () => {
    toast.success("Invoice shared");
  };

  const handleRateWorker = () => {
    toast.success("Thank you for your feedback!");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-zinc-900 dark:text-white">Invoice</h1>
            <p className="text-sm text-zinc-500">Booking ID: {currentBooking.id}</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-950 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">
            Service Completed!
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your {currentBooking.service.toLowerCase()} service has been completed successfully
          </p>
        </motion.div>

        {/* Worker Rating Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4 text-zinc-900 dark:text-white">
              Rate Your Experience
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={selectedWorker.avatar} />
                <AvatarFallback>{selectedWorker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-white">
                  {selectedWorker.name}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {currentBooking.service}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="outline"
                  size="icon"
                  className="hover:bg-yellow-50 dark:hover:bg-yellow-950"
                  onClick={handleRateWorker}
                >
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </Button>
              ))}
            </div>
            <p className="text-sm text-zinc-500 text-center">
              Tap stars to rate the service
            </p>
          </Card>
        </motion.div>

        {/* Invoice Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-lg">
                  <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                  Payment Details
                </h3>
              </div>
              <Badge variant="secondary">PAID</Badge>
            </div>

            <div className="space-y-4">
              {/* Date and Time */}
              <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500 mb-1">Date</p>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-1">Time</p>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Service Details */}
              <div>
                <p className="text-sm text-zinc-500 mb-3">Service Breakdown</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {currentBooking.service} - Labor
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-white">
                      ₹{baseCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Materials & Parts
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-white">
                      ₹{materialCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Service Duration
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-white">
                      1.5 hours
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tax */}
              <div className="flex justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">
                  GST (18%)
                </span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  ₹{gst.toFixed(2)}
                </span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{totalCost.toFixed(2)}
                </span>
              </div>

              {/* Payment Method */}
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Payment Method
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Cash on Delivery
                    </p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleDownload} className="h-12">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShare} className="h-12">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <Button
            onClick={() => navigate("/")}
            className="w-full h-14 text-base"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
              💡 Need another service? Book again anytime!
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
