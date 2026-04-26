import { GearLoader } from "../components/GearLoader";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

export default function GearLoaderDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-zinc-900 dark:text-white">
            Gear Loader Demo
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Default */}
        <section className="text-center space-y-4">
          <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            Default (200px)
          </h2>
          <div className="flex items-center justify-center p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <GearLoader />
          </div>
        </section>

        {/* Large */}
        <section className="text-center space-y-4">
          <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            Large (400px)
          </h2>
          <div className="flex items-center justify-center p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <GearLoader size={400} />
          </div>
        </section>

        {/* Small + Fast */}
        <section className="text-center space-y-4">
          <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            Small (100px) &amp; Fast (1.5s)
          </h2>
          <div className="flex items-center justify-center p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <GearLoader size={100} speed={1.5} />
          </div>
        </section>

        {/* On dark surface */}
        <section className="text-center space-y-4">
          <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            On Dark Surface
          </h2>
          <div className="flex items-center justify-center p-8 rounded-2xl bg-zinc-900">
            <GearLoader size={250} />
          </div>
        </section>
      </div>
    </div>
  );
}
