import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import type { LessonPlan } from "../lib/gemini";

interface SidebarProps {
  lessonPlan: LessonPlan;
  currentSectionIndex: number;
  currentChunkIndex: number;
  completedSections: Set<string>;
  onSectionClick: (index: number) => void;
}

export function Sidebar({
  lessonPlan,
  currentSectionIndex,
  currentChunkIndex,
  completedSections,
  onSectionClick,
}: SidebarProps) {
  return (
    <aside className="w-80 bg-slate-50 border-r border-slate-200 h-screen flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Course Progress
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{
                width: `${(completedSections.size / lessonPlan.sections.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600">
            {completedSections.size}/{lessonPlan.sections.length}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {lessonPlan.sections.map((section, idx) => {
          const isCompleted = completedSections.has(section.id);
          const isActive = idx === currentSectionIndex;
          const isLocked = idx > currentSectionIndex && !isCompleted;

          return (
            <button
              key={section.id}
              onClick={() => !isLocked && onSectionClick(idx)}
              disabled={isLocked}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all flex items-start gap-3 group",
                isActive
                  ? "bg-white shadow-sm border border-slate-200 ring-1 ring-indigo-500/10"
                  : isLocked
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-slate-100"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 shrink-0",
                  isCompleted ? "text-emerald-500" : isActive ? "text-indigo-600" : "text-slate-400"
                )}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold truncate",
                    isActive ? "text-indigo-600" : "text-slate-700"
                  )}
                >
                  {section.title}
                </p>
                {isActive && (
                  <p className="text-xs text-slate-500 mt-1">
                    Chunk {currentChunkIndex + 1} of {section.chunks.length}
                  </p>
                )}
              </div>
              {!isLocked && !isActive && (
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 bg-white border-t border-slate-200">
        <div className="p-4 bg-indigo-50 rounded-xl">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
            Pro Tip
          </p>
          <p className="text-xs text-indigo-900 leading-relaxed">
            Try to explain concepts in your own words to build stronger neural connections.
          </p>
        </div>
      </div>
    </aside>
  );
}
