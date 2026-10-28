import { GoogleGenAI } from "@google/genai";
import {
  getFallbackCheatSheet,
  getFallbackFlashcards,
  getFallbackQuiz,
  Flashcard,
  QuizQuestion,
} from "../utils/synapseLogic";

export interface CramResult {
  type: "cheatsheet" | "flashcards" | "quiz";
  moduleName: string;
  cheatSheetContent?: string;
  flashcards?: Flashcard[];
  quizQuestions?: QuizQuestion[];
  rawText?: string;
  source: "live" | "demo";
}

export async function runCramAction(
  action: "cheatsheet" | "flashcards" | "quiz",
  moduleName: string,
  notesContent: string,
  apiKey?: string,
  frequentConcepts?: string[]
): Promise<CramResult> {
  const activeKey = apiKey?.trim();
  const conceptEmphasis = frequentConcepts && frequentConcepts.length > 0
    ? `IMPORTANT: Pay special attention to the user's most frequently repeated/emphasized concepts from their notes: ${frequentConcepts.join(", ")}.`
    : "";

  if (activeKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });

      if (action === "cheatsheet") {
        const prompt = `You are an elite academic tutor.
Extract ONLY key equations, theorems, rules, formulas, and fundamental definitions from the following notes in clean Markdown with LaTeX math syntax.
${conceptEmphasis}
Prioritize formulas and laws for the concepts the user emphasizes most often.

NOTES:
${notesContent}`;

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });

        if (response.text) {
          return {
            type: "cheatsheet",
            moduleName,
            cheatSheetContent: response.text,
            source: "live",
          };
        }
      } else if (action === "flashcards") {
        const prompt = `Based on these notes, create exactly 3 high-yield Question & Answer flashcards in JSON format:
[
  {"q": "Question 1", "a": "Answer 1"},
  {"q": "Question 2", "a": "Answer 2"},
  {"q": "Question 3", "a": "Answer 3"}
]
${conceptEmphasis}
Make sure each flashcard directly tests one of these high-frequency concepts or laws.
Return ONLY valid JSON with no markdown wrapping.
NOTES:
${notesContent}`;

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });

        if (response.text) {
          let cleaned = response.text.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
          }
          const parsed = JSON.parse(cleaned) as Flashcard[];
          return {
            type: "flashcards",
            moduleName,
            flashcards: parsed,
            source: "live",
          };
        }
      } else if (action === "quiz") {
        const prompt = `Based on these notes, create a 2-question multiple choice quiz in JSON format:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "explanation": "Why this is correct."
  }
]
${conceptEmphasis}
Formulate questions around the most frequently emphasized definitions and equations.
Return ONLY valid JSON with no markdown wrapping.
NOTES:
${notesContent}`;

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });

        if (response.text) {
          let cleaned = response.text.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
          }
          const parsed = JSON.parse(cleaned) as QuizQuestion[];
          return {
            type: "quiz",
            moduleName,
            quizQuestions: parsed,
            source: "live",
          };
        }
      }
    } catch (err) {
      console.warn("Live Gemini API call failed, falling back to smart demo outputs:", err);
    }
  }

  // High-Yield Fallback Dummies (Hackathon Demo Resilience)
  if (action === "cheatsheet") {
    return {
      type: "cheatsheet",
      moduleName,
      cheatSheetContent: getFallbackCheatSheet(moduleName),
      source: "demo",
    };
  } else if (action === "flashcards") {
    return {
      type: "flashcards",
      moduleName,
      flashcards: getFallbackFlashcards(moduleName),
      source: "demo",
    };
  } else {
    return {
      type: "quiz",
      moduleName,
      quizQuestions: getFallbackQuiz(moduleName),
      source: "demo",
    };
  }
}
