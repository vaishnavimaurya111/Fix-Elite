import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, AlertCircle, Sparkles, ChevronRight, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useApp, AIEstimate } from "../context/AppContext";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ThemeToggle } from "../components/ThemeToggle";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";

export default function ProblemDescription() {
  const navigate = useNavigate();
  const {
    selectedService,
    problemDescription,
    setProblemDescription,
    problemImage,
    setProblemImage,
    setAiEstimate,
    isEmergency,
    setIsEmergency,
  } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimate, setEstimate] = useState<AIEstimate | null>(null);

  if (!selectedService) {
    navigate("/");
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProblemImage(reader.result as string);
        toast.success("Image uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWithAI = () => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      let aiResult: AIEstimate;

      // Mock AI logic based on service and keywords
      const desc = problemDescription.toLowerCase();
      
      if (selectedService.id === "plumber") {
        if (desc.includes("leak") || desc.includes("water")) {
          aiResult = {
            problemType: "Water Leakage",
            suggestedService: "Plumbing Repair",
            estimatedCost: "₹300 - ₹800",
            urgency: desc.includes("emergency") || desc.includes("urgent") ? "high" : "medium",
            description: "Based on your description, this appears to be a water leakage issue requiring immediate attention.",
            tips: [
              "Turn off the main water supply if leaking heavily",
              "Place a bucket under the leak",
              "Avoid using water in that area",
            ],
          };
        } else {
          aiResult = {
            problemType: "General Plumbing",
            suggestedService: "Plumbing Service",
            estimatedCost: "₹200 - ₹500",
            urgency: "low",
            description: "Standard plumbing service required.",
            tips: ["Have details ready about the issue location"],
          };
        }
      } else if (selectedService.id === "electrician") {
        if (desc.includes("spark") || desc.includes("short")) {
          aiResult = {
            problemType: "Electrical Hazard",
            suggestedService: "Emergency Electrical Repair",
            estimatedCost: "₹500 - ₹1500",
            urgency: "high",
            description: "Potential electrical hazard detected. Immediate professional attention required.",
            tips: [
              "Turn off main power supply",
              "Don't touch exposed wires",
              "Keep area clear and dry",
            ],
          };
        } else {
          aiResult = {
            problemType: "Electrical Issue",
            suggestedService: "Electrical Repair",
            estimatedCost: "₹250 - ₹700",
            urgency: "medium",
            description: "Electrical repair service needed.",
            tips: ["Note which circuit breaker is affected"],
          };
        }
      } else if (selectedService.id === "ac-repair") {
        aiResult = {
          problemType: "AC Malfunction",
          suggestedService: "AC Repair & Service",
          estimatedCost: "₹400 - ₹1200",
          urgency: desc.includes("not cooling") ? "medium" : "low",
          description: "AC repair or maintenance service required.",
          tips: [
            "Clean filters before technician arrives",
            "Note any unusual sounds",
            "Check if outdoor unit is running",
          ],
        };
      } else {
        aiResult = {
          problemType: "General Service",
          suggestedService: selectedService.name,
          estimatedCost: "₹300 - ₹1000",
          urgency: "medium",
          description: `${selectedService.name} service required based on your description.`,
          tips: ["Prepare the area for easy access"],
        };
      }

      setEstimate(aiResult);
      setAiEstimate(aiResult);
      setShowEstimate(true);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleContinue = () => {
    if (!problemDescription.trim()) {
      toast.error("Please describe your problem");
      return;
    }
    if (!estimate) {
      analyzeWithAI();
    } else {
      navigate("/select-worker");
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
                Describe Your Problem
              </h1>
              <p className="text-sm text-zinc-500">{selectedService.name}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Emergency Toggle */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-950 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <Label htmlFor="emergency-mode" className="font-semibold">
                    Emergency Mode
                  </Label>
                  <p className="text-sm text-zinc-500">Priority booking</p>
                </div>
              </div>
              <Switch
                id="emergency-mode"
                checked={isEmergency}
                onCheckedChange={setIsEmergency}
              />
            </div>
            {isEmergency && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900"
              >
                <p className="text-sm text-red-700 dark:text-red-400">
                  Emergency bookings get priority and fastest response time
                </p>
              </motion.div>
            )}
          </Card>

          {/* Problem Description */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">
              What's the problem?
            </Label>
            <Textarea
              placeholder={`E.g., "Water leaking from kitchen sink pipe" or "Power outlet not working in bedroom"`}
              className="min-h-[120px] text-base"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
            />
          </Card>

          {/* Image Upload */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">
              Upload Photo (Optional)
            </Label>
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {problemImage ? (
                  <div className="space-y-3">
                    <img
                      src={problemImage}
                      alt="Problem"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <Button variant="outline" size="sm" type="button">
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-blue-100 dark:bg-blue-950 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        Upload a photo
                      </p>
                      <p className="text-sm text-zinc-500">
                        Helps us understand the issue better
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </Card>

          {/* AI Analysis Button */}
          {problemDescription && !showEstimate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={analyzeWithAI}
                disabled={isAnalyzing}
                className="w-full h-14 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Problem with AI
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* AI Estimate Card */}
          {showEstimate && estimate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-6 border-2 border-purple-500 dark:border-purple-400">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-lg">AI Analysis</h3>
                  <Badge
                    variant={
                      estimate.urgency === "high"
                        ? "destructive"
                        : estimate.urgency === "medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {estimate.urgency.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Problem Type</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {estimate.problemType}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Estimated Cost</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {estimate.estimatedCost}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500 mb-2">
                      Recommended Actions
                    </p>
                    <ul className="space-y-2">
                      {estimate.tips.map((tip, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                        >
                          <AlertCircle className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Continue Button */}
          {showEstimate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={handleContinue}
                className="w-full h-14 text-base"
                size="lg"
              >
                Find Workers Nearby
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
