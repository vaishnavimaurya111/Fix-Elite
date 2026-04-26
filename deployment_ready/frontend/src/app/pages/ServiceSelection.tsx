import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ThemeToggle";

export default function ServiceSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-zinc-900 dark:text-white">
              Select Service
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-zinc-600 dark:text-zinc-400">
          Service selection page (redirects to home)
        </p>
      </div>
    </div>
  );
}
