import { RefreshCw, BookOpen, BrainCircuit, MessageSquare } from "lucide-react";
import { cn } from "../lib/utils";

interface NavbarProps {
  title: string;
  currentMode: "lesson" | "quiz" | "socratic";
  progress: number;
  onReset: () => void;
  onModeChange: (mode: "lesson" | "quiz" | "socratic") => void;
}

export function Navbar({ title, currentMode, progress, onReset, onModeChange }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-2 bg-indigo-600 text-white rounded-lg">
          <BrainCircuit size={24} />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>
      </div>

      <nav className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
        <button
          onClick={() => onModeChange("lesson")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            currentMode === "lesson"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <BookOpen size={16} />
          Lesson
        </button>
        <button
          onClick={() => onModeChange("quiz")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            currentMode === "quiz"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <BrainCircuit size={16} />
          Quiz
        </button>
        <button
          onClick={() => onModeChange("socratic")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            currentMode === "socratic"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <MessageSquare size={16} />
          Socratic
        </button>
      </nav>

      <div className="flex-1 flex justify-end">
        <button
          onClick={onReset}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw size={18} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}
