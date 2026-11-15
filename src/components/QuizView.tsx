import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, ChevronRight, RefreshCw, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";
import type { QuizQuestion } from "../lib/gemini";

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export function QuizView({ questions, onComplete }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    setSelectedOption(null);
    setShortAnswer("");
    setIsSubmitted(false);
    setIsCorrect(null);
    setShowExplanation(false);
  }, [currentQuestionIndex]);

  const handleSubmit = () => {
    if (isSubmitted) return;

    const answer = currentQuestion.options ? selectedOption : shortAnswer;
    if (!answer) return;

    const correct = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          Quiz Mode
        </span>
        <span className="text-xs font-medium text-slate-500">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options ? (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOption === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => !isSubmitted && setSelectedOption(option)}
                      disabled={isSubmitted}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group",
                        isSubmitted
                          ? isCorrectOption
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : isSelected
                            ? "border-rose-500 bg-rose-50 text-rose-900"
                            : "border-slate-100 opacity-50"
                          : isSelected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                          : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                      )}
                    >
                      <span className="font-medium">{option}</span>
                      {isSubmitted && isCorrectOption && <CheckCircle2 size={20} className="text-emerald-500" />}
                      {isSubmitted && isSelected && !isCorrectOption && <AlertCircle size={20} className="text-rose-500" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                    isSubmitted
                      ? isCorrect
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-rose-500 bg-rose-50"
                      : "border-slate-200"
                  )}
                  disabled={isSubmitted}
                />
              </div>
            )}
          </div>

          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-6 rounded-2xl border flex items-start gap-4",
                  isCorrect
                    ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                    : "bg-rose-50 border-rose-100 text-rose-900"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                  {isCorrect ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold mb-1">
                    {isCorrect ? "Correct!" : "Not quite right"}
                  </p>
                  {showExplanation ? (
                    <p className="text-sm leading-relaxed opacity-90 italic">
                      {currentQuestion.explanation}
                    </p>
                  ) : (
                    <button
                      onClick={() => setShowExplanation(true)}
                      className="text-sm font-semibold underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity flex items-center gap-2"
                    >
                      <HelpCircle size={16} />
                      Show Explanation
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-8 border-t border-slate-100">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={currentQuestion.options ? !selectedOption : !shortAnswer.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Submit Answer
              </button>
            ) : (
              <div className="flex items-center gap-4 w-full">
                {!isCorrect && (
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setIsCorrect(null);
                      setSelectedOption(null);
                      setShortAnswer("");
                      setShowExplanation(false);
                    }}
                    className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Try Again
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={cn(
                    "py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2",
                    isCorrect ? "w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200" : "flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                  )}
                >
                  {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
