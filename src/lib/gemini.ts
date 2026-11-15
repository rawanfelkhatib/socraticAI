import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface LessonChunk {
  id: string;
  explanation: string;
  prompt: string;
  hint: string;
  challengePrompt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface LessonSection {
  id: string;
  title: string;
  chunks: LessonChunk[];
  quiz: QuizQuestion[];
}

export interface LessonPlan {
  title: string;
  sections: LessonSection[];
}

export async function generateLessonPlan(pdfText: string): Promise<LessonPlan> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following text from a PDF and generate a structured lesson plan. 
    Break it down into 3-5 logical sections. 
    Each section should have 2-4 chunks of content. 
    Each chunk should have a short explanation (max 100 words), a prompt for the student to reflect or answer, and a hint.
    Each section should end with a 2-3 question quiz (multiple choice or short answer).
    
    TEXT:
    ${pdfText.substring(0, 10000)}`, // Limit text for token limits
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                chunks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      prompt: { type: Type.STRING },
                      hint: { type: Type.STRING },
                      challengePrompt: { type: Type.STRING },
                    },
                    required: ["id", "explanation", "prompt", "hint"],
                  },
                },
                quiz: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      question: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                    required: ["id", "question", "correctAnswer", "explanation"],
                  },
                },
              },
              required: ["id", "title", "chunks", "quiz"],
            },
          },
        },
        required: ["title", "sections"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function evaluateResponse(
  context: string,
  prompt: string,
  studentResponse: string
): Promise<{ isCorrect: boolean; feedback: string; isStrong: boolean }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Context: ${context}
    Prompt: ${prompt}
    Student Response: ${studentResponse}
    
    Evaluate the student's response. Is it accurate and does it show understanding? 
    Provide constructive feedback. 
    Also, determine if the response is exceptionally strong (isStrong: true).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING },
          isStrong: { type: Type.BOOLEAN },
        },
        required: ["isCorrect", "feedback", "isStrong"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function getSocraticQuestion(
  context: string,
  history: { role: string; text: string }[]
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { text: `You are a Socratic tutor. Based on the following context, ask a deep, open-ended question to help the student think critically. 
      Context: ${context}` },
      ...history.map(h => ({ text: `${h.role}: ${h.text}` }))
    ],
  });

  return response.text || "What do you think about this?";
}
