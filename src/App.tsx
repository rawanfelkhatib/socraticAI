import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileUploader } from "./components/FileUploader";
import { Sidebar } from "./components/Sidebar";
import { LessonView } from "./components/LessonView";
import { QuizView } from "./components/QuizView";
import { SocraticView } from "./components/SocraticView";
import { Navbar } from "./components/Navbar";
import { extractTextFromPDF } from "./lib/pdf";
import { generateLessonPlan, evaluateResponse, getSocraticQuestion, type LessonPlan } from "./lib/gemini";

type AppMode = "upload" | "lesson" | "quiz" | "socratic";

export default function App() {
  const [mode, setMode] = useState<AppMode>("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isStrongUser, setIsStrongUser] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await extractTextFromPDF(file);
      const plan = await generateLessonPlan(text);
      setLessonPlan(plan);
      setMode("lesson");
    } catch (error) {
      console.error("Error processing PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChunkComplete = (isStrong: boolean) => {
    if (isStrong) setIsStrongUser(true);

    const currentSection = lessonPlan!.sections[currentSectionIndex];
    if (currentChunkIndex < currentSection.chunks.length - 1) {
      setCurrentChunkIndex(currentChunkIndex + 1);
    } else {
      // Section complete, move to quiz
      setMode("quiz");
    }
  };

  const handleQuizComplete = () => {
    const currentSection = lessonPlan!.sections[currentSectionIndex];
    setCompletedSections((prev) => new Set([...prev, currentSection.id]));
    
    if (currentSectionIndex < lessonPlan!.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentChunkIndex(0);
      setMode("lesson");
    } else {
      setMode("socratic");
    }
  };

  const handleEvaluate = async (response: string) => {
    const currentSection = lessonPlan!.sections[currentSectionIndex];
    const currentChunk = currentSection.chunks[currentChunkIndex];
    return await evaluateResponse(currentChunk.explanation, currentChunk.prompt, response);
  };

  const handleSocraticMessage = async (message: string) => {
    const context = lessonPlan?.sections[currentSectionIndex].chunks[currentChunkIndex].explanation || "";
    return await getSocraticQuestion(context, [{ role: "student", text: message }]);
  };

  const handleReset = () => {
    setMode("upload");
    setLessonPlan(null);
    setCurrentSectionIndex(0);
    setCurrentChunkIndex(0);
    setCompletedSections(new Set());
    setIsStrongUser(false);
  };

  const progress = lessonPlan 
    ? (completedSections.size / lessonPlan.sections.length) * 100 
    : 0;

  if (mode === "upload") {
    return (
      <div className="min-h-screen bg-slate-50">
        <FileUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar
        title={lessonPlan?.title || "Socratic Tutor"}
        currentMode={mode === "upload" ? "lesson" : mode as any}
        progress={progress}
        onReset={handleReset}
        onModeChange={(newMode) => setMode(newMode as AppMode)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          lessonPlan={lessonPlan!}
          currentSectionIndex={currentSectionIndex}
          currentChunkIndex={currentChunkIndex}
          completedSections={completedSections}
          onSectionClick={(idx) => {
            setCurrentSectionIndex(idx);
            setCurrentChunkIndex(0);
            setMode("lesson");
          }}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          <AnimatePresence mode="wait">
            {mode === "lesson" && (
              <motion.div
                key="lesson"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <LessonView
                  section={lessonPlan!.sections[currentSectionIndex]}
                  currentChunkIndex={currentChunkIndex}
                  onChunkComplete={handleChunkComplete}
                  onShowHint={() => {}}
                  onEvaluate={handleEvaluate}
                />
              </motion.div>
            )}

            {mode === "quiz" && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <QuizView
                  questions={lessonPlan!.sections[currentSectionIndex].quiz}
                  onComplete={handleQuizComplete}
                />
              </motion.div>
            )}

            {mode === "socratic" && (
              <motion.div
                key="socratic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <SocraticView onSendMessage={handleSocraticMessage} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
