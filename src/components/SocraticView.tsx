import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2, Sparkles, User } from "lucide-react";
import { cn } from "../lib/utils";

interface Message {
  id: string;
  role: "system" | "student";
  text: string;
}

interface SocraticViewProps {
  onSendMessage: (message: string) => Promise<string>;
}

export function SocraticView({ onSendMessage }: SocraticViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      text: "Hello! I'm your Socratic tutor. Let's explore this topic together. What's your initial thought on how this concept applies to real-world scenarios?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const studentMessage: Message = {
      id: Date.now().toString(),
      role: "student",
      text: input,
    };

    setMessages((prev) => [...prev, studentMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const response = await onSendMessage(input);
      
      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        text: response,
      };
      
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error("Socratic error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto py-8 px-6">
      <div className="mb-6 flex items-center gap-2 text-indigo-600">
        <Sparkles size={20} />
        <h2 className="text-sm font-bold uppercase tracking-wider">
          Socratic Dialogue
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                message.role === "student" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  message.role === "system"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {message.role === "system" ? <Sparkles size={16} /> : <User size={16} />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                  message.role === "system"
                    ? "bg-white border border-slate-200 text-slate-800 shadow-sm"
                    : "bg-indigo-600 text-white shadow-md"
                )}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Loader2 className="animate-spin" size={16} />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-8 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your response..."
          className="w-full p-4 pr-14 bg-white border border-slate-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
