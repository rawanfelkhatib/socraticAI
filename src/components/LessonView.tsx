import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, HelpCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import type { LessonSection, LessonChunk } from "../lib/gemini";

interface LessonViewProps {
  section: LessonSection;
  currentChunkIndex: number;
  onChunkComplete: (isStrong: boolean) => void;
  onShowHint: () => void;
  onEvaluate: (response: string) => Promise<{ isCorrect: boolean; feedback: string; isStrong: boolean }>;
}

export function LessonView({
  section,
  currentChunkIndex,
  onChunkComplete,
  onShowHint,
  onEvaluate,
}: LessonViewProps) {
  const [response, setResponse] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentChunk = section.chunks[currentChunkIndex];

  useEffect(() => {
    setResponse("");
    setFeedback(null);
    setShowHint(false);
    inputRef.current?.focus();
  }, [currentChunkIndex]);

  const handleSubmit = async () => {
    if (!response.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const result = await onEvaluate(response);
      setFeedback({ isCorrect: result.isCorrect, text: result.feedback });
      
      if (result.isCorrect) {
        setTimeout(() => {
          onChunkComplete(result.isStrong);
        }, 2000);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentChunk.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
              Concept {currentChunkIndex + 1}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              {section.title}
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-600 leading-relaxed">
                {currentChunk.explanation}
              </p>
            </div>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <HelpCircle size={24} />
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium text-slate-900 mb-4">
                  {currentChunk.prompt}
                </p>
                <textarea
                  ref={inputRef}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-700"
                  disabled={isEvaluating || feedback?.isCorrect}
                />
              </div>
            </div>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 italic"
                >
                  <span className="font-semibold block mb-1">Hint:</span>
                  {currentChunk.hint}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-4 rounded-xl flex items-start gap-3",
                    feedback.isCorrect
                      ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
                      : "bg-rose-50 border border-rose-100 text-rose-800"
                  )}
                >
                  {feedback.isCorrect ? (
                    <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className="font-semibold mb-1">
                      {feedback.isCorrect ? "Great understanding!" : "Not quite there..."}
                    </p>
                    <p className="leading-relaxed opacity-90">{feedback.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowHint(true)}
                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2"
                disabled={isEvaluating || feedback?.isCorrect}
              >
                <HelpCircle size={16} />
                Need a hint?
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!response.trim() || isEvaluating || feedback?.isCorrect}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Evaluating...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
