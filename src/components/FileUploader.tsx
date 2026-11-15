import React, { useState, useCallback } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUploader({ onFileSelect, isProcessing }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-20 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Socratic Tutor AI
        </h1>
        <p className="text-slate-500 text-lg">
          Upload a PDF to transform it into an interactive learning journey.
        </p>
      </motion.div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer",
          isDragging
            ? "border-indigo-500 bg-indigo-50/50"
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
          <Upload size={32} />
        </div>
        
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900">
            {selectedFile ? selectedFile.name : "Drag and drop your PDF here"}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Support for PDF files up to 10MB
          </p>
        </div>
      </div>

      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm w-full">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            onClick={() => onFileSelect(selectedFile)}
            disabled={isProcessing}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating Lessons...
              </>
            ) : (
              "Generate Lessons"
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
