import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  HelpCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Flame,
  ArrowRight,
  TrendingUp,
  Hash,
} from "lucide-react";
import { CramResult, runCramAction } from "../services/geminiService";
import {
  Flashcard,
  QuizQuestion,
  ModuleGoal,
  calculateGoalProgress,
  extractFrequentConcepts,
  parseCheatSheetContent,
  CheatSheetSection,
} from "../utils/synapseLogic";

interface CramStationTabProps {
  modules: string[];
  selectedModule: string;
  setSelectedModule: (mod: string) => void;
  notes: Record<string, string>;
  studyCounts: Record<string, number>;
  goals: Record<string, ModuleGoal>;
  onLogStudySession: (module: string) => void;
  apiKey: string;
}

export const CramStationTab: React.FC<CramStationTabProps> = ({
  modules,
  selectedModule,
  setSelectedModule,
  notes,
  studyCounts,
  goals,
  onLogStudySession,
  apiKey,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<CramResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRawCheatSheet, setShowRawCheatSheet] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  // Flashcards state
  const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({});

  // Quiz state: selected options & whether answer expander is open
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [expandedQuiz, setExpandedQuiz] = useState<Record<number, boolean>>({});

  const currentNotes = notes[selectedModule] || "";
  const frequentConcepts = extractFrequentConcepts(currentNotes);
  const frequentTermList = frequentConcepts.map((c) => c.term);

  const handleAction = async (action: "cheatsheet" | "flashcards" | "quiz") => {
    // 1. CRITICAL FEATURE: Auto increment study activity counter by +1
    onLogStudySession(selectedModule);

    // 2. Clear state and trigger AI cram engine
    setLoading(true);
    setRevealedCards({});
    setUserAnswers({});
    setExpandedQuiz({});

    try {
      const result = await runCramAction(
        action,
        selectedModule,
        currentNotes,
        apiKey,
        frequentTermList
      );
      setCurrentResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyCheatSheet = () => {
    if (currentResult?.cheatSheetContent) {
      navigator.clipboard.writeText(currentResult.cheatSheetContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const toggleCard = (index: number) => {
    setRevealedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleQuizExpander = (index: number) => {
    setExpandedQuiz((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSelectQuizOption = (qIndex: number, option: string) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const currentCount = studyCounts[selectedModule] ?? 0;
  const currentGoal = goals[selectedModule] || { target: 5, timeframe: "weekly" };
  const { percentage, isCompleted } = calculateGoalProgress(currentCount, currentGoal.target);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>TAB 2: AI Cram Station</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              High-Yield Synthesis &amp; Active Recall Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Extract formulas, test conceptual retention with 3 flashcards, or generate a 2-question practice quiz. Every trigger logs a study session towards your {currentGoal.timeframe} goal ({currentCount}/{currentGoal.target}).
            </p>
          </div>

          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl self-start sm:self-auto">
            <Flame className="w-4 h-4 text-orange-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-900 block">
                Session Counter
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-indigo-700 font-mono">
                  {currentCount} {currentCount === 1 ? "Session" : "Sessions"}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-200/60 text-indigo-900 font-bold">
                  {percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Station */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {/* Module Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
              Module to Cram:
            </label>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setCurrentResult(null);
              }}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
            >
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m} ({studyCounts[m] ?? 0} sessions)
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500">
            Selected for study: <strong>{selectedModule}</strong>
          </span>
        </div>

        {/* Frequently Emphasized Concepts Panel */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                🔥 Frequently Emphasized in Your Notes
              </h4>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Flashcards, Cheat Sheets &amp; Quizzes prioritize these high-yield topics
            </span>
          </div>

          {frequentConcepts.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {frequentConcepts.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs hover:border-indigo-300 transition-colors"
                >
                  <span className="text-indigo-600 font-bold">#{idx + 1}</span>
                  <span>{item.term}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-bold">
                    x{item.count}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Paste or upload notes in the Module Vault to automatically detect recurrent concepts.
            </p>
          )}
        </div>

        {/* 3 Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Button 1: Extract Cheat Sheet */}
          <button
            onClick={() => handleAction("cheatsheet")}
            disabled={loading}
            className="group relative p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-gradient-to-b from-white to-slate-50/50 hover:to-indigo-50/30 text-left transition-all hover:shadow-md cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                📐
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                +1 Study Count
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Extract Cheat Sheet &amp; Formulas
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Extracts ONLY key equations, theorems, rules, and mathematical definitions from notes.
            </p>
          </button>

          {/* Button 2: Generate 3 Flashcards */}
          <button
            onClick={() => handleAction("flashcards")}
            disabled={loading}
            className="group relative p-4 rounded-xl border border-slate-200 hover:border-purple-300 bg-gradient-to-b from-white to-slate-50/50 hover:to-purple-50/30 text-left transition-all hover:shadow-md cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base">
                🃏
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                +1 Study Count
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Generate 3 Flashcards
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Creates 3 high-yield active recall Question &amp; Answer cards for rapid self-testing.
            </p>
          </button>

          {/* Button 3: Generate Practice Quiz */}
          <button
            onClick={() => handleAction("quiz")}
            disabled={loading}
            className="group relative p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-gradient-to-b from-white to-slate-50/50 hover:to-emerald-50/30 text-left transition-all hover:shadow-md cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                📝
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +1 Study Count
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Generate Practice Quiz
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Generates a 2-question Multiple Choice Quiz with answers hidden inside expandable tabs.
            </p>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 animate-pulse">
            <Sparkles className="w-7 h-7 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              Gemini AI is analyzing lecture notes for {selectedModule}...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Extracting formulas, questions, and verifying academic clarity.
            </p>
          </div>
        )}

        {/* Empty state guidance */}
        {!loading && !currentResult && (
          <div className="p-8 text-center bg-slate-50/70 border border-dashed border-slate-300 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No Cram Session Active Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Click any of the 3 buttons above to extract a cheat sheet, study 3 flashcards, or take a 2-question quiz on <strong>{selectedModule}</strong>.
            </p>
          </div>
        )}

        {/* Result Display */}
        {!loading && currentResult && (
          <div className="pt-4 border-t border-slate-100 space-y-5 animate-in fade-in duration-300">
            {/* Header of Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">
                  {currentResult.type === "cheatsheet" && "📐 High-Yield Cheat Sheet & Formulas"}
                  {currentResult.type === "flashcards" && "🃏 3 Active Recall Flashcards"}
                  {currentResult.type === "quiz" && "📝 2-Question Practice Quiz"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  Module: {currentResult.moduleName}
                </span>
                {currentResult.source === "demo" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200">
                    Demo Output
                  </span>
                )}
              </div>

              {currentResult.type === "cheatsheet" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRawCheatSheet(!showRawCheatSheet)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <span>{showRawCheatSheet ? "📋 Formatted Cards" : "💻 Raw Markdown"}</span>
                  </button>
                  <button
                    onClick={copyCheatSheet}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 1. CHEAT SHEET DISPLAY - STRUCTURED CARDS (FIX RAW DISPLAY BUG) */}
            {currentResult.type === "cheatsheet" && currentResult.cheatSheetContent && (
              <div className="space-y-4">
                {showRawCheatSheet ? (
                  <div className="bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                    {currentResult.cheatSheetContent}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {parseCheatSheetContent(currentResult.cheatSheetContent).map((section, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {section.icon || "📐"}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            {section.title}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium ml-auto">
                            {section.items.length} {section.items.length === 1 ? "Formula / Rule" : "Formulas & Rules"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {section.items.map((item, iIdx) => {
                            const formulaKey = `${sIdx}-${iIdx}`;
                            const isFormulaCopied = copiedFormula === formulaKey;
                            return (
                              <div
                                key={iIdx}
                                className={`p-3.5 rounded-xl border transition-all ${
                                  item.isKeyFormula
                                    ? "bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200"
                                    : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h5 className="text-xs font-bold text-slate-900">
                                    {item.term}
                                  </h5>
                                  {item.formula && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (item.formula) {
                                          navigator.clipboard.writeText(item.formula);
                                          setCopiedFormula(formulaKey);
                                          setTimeout(() => setCopiedFormula(null), 2000);
                                        }
                                      }}
                                      className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-mono transition-colors cursor-pointer shrink-0"
                                      title="Copy equation formula"
                                    >
                                      {isFormulaCopied ? "✓ Copied" : "Copy eq"}
                                    </button>
                                  )}
                                </div>

                                {item.formula && (
                                  <div className="my-2 px-3 py-2 rounded-lg bg-white border border-indigo-200 shadow-2xs font-mono text-xs sm:text-sm font-bold text-indigo-950 tracking-wide overflow-x-auto">
                                    {item.formula}
                                  </div>
                                )}

                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {item.details}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. FLASHCARDS DISPLAY */}
            {currentResult.type === "flashcards" && currentResult.flashcards && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentResult.flashcards.map((card, idx) => {
                  const isRevealed = !!revealedCards[idx];
                  return (
                    <div
                      key={idx}
                      className="bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-300 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase">
                            Card #{idx + 1}
                          </span>
                          <span className="text-xs">💡</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-4 min-h-[60px]">
                          {card.q}
                        </h4>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        {isRevealed ? (
                          <div className="p-3 rounded-lg bg-indigo-50/80 border border-indigo-100 text-indigo-950 text-xs leading-relaxed animate-in fade-in duration-200">
                            <span className="font-bold text-[10px] text-indigo-700 block uppercase mb-1">
                              Answer:
                            </span>
                            {card.a}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400 text-xs italic">
                            Answer hidden for active recall
                          </div>
                        )}

                        <button
                          onClick={() => toggleCard(idx)}
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          {isRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide Answer</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-indigo-600" />
                              <span>👁️ Reveal Answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. PRACTICE QUIZ DISPLAY */}
            {currentResult.type === "quiz" && currentResult.quizQuestions && (
              <div className="space-y-4">
                {currentResult.quizQuestions.map((quiz, qIdx) => {
                  const selectedOption = userAnswers[qIdx];
                  const isExpanded = !!expandedQuiz[qIdx];
                  const isCorrect = selectedOption === quiz.answer;

                  return (
                    <div
                      key={qIdx}
                      className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-bold text-slate-900">
                          <span className="text-indigo-600 font-mono mr-1.5">
                            Q{qIdx + 1}:
                          </span>
                          {quiz.question}
                        </h4>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          Multiple Choice
                        </span>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quiz.options.map((opt, optIdx) => {
                          const isPicked = selectedOption === opt;
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleSelectQuizOption(qIdx, opt)}
                              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                                isPicked
                                  ? "bg-indigo-50 border-indigo-400 text-indigo-950 ring-1 ring-indigo-300"
                                  : "bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`quiz_q_${qIdx}`}
                                checked={isPicked}
                                onChange={() => {}}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Streamlit expander equivalent for answer */}
                      <div className="pt-2">
                        <button
                          onClick={() => toggleQuizExpander(qIdx)}
                          className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                            💡 Check Answer &amp; Explanation (st.expander)
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2 animate-in fade-in duration-150">
                            {selectedOption ? (
                              <div
                                className={`p-2 rounded-lg font-medium flex items-center gap-2 ${
                                  isCorrect
                                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                                    : "bg-amber-50 text-amber-900 border border-amber-200"
                                }`}
                              >
                                {isCorrect ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span>
                                      🎉 Correct! Your answer <strong>"{selectedOption}"</strong> is correct.
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <HelpCircle className="w-4 h-4 text-amber-600" />
                                    <span>
                                      Your selection was <em>"{selectedOption}"</em>. Correct Answer: <strong>{quiz.answer}</strong>
                                    </span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-700 font-semibold">
                                Correct Answer: <span className="text-emerald-700">{quiz.answer}</span>
                              </div>
                            )}

                            <div>
                              <span className="font-bold text-slate-800 block mb-0.5">
                                Explanation:
                              </span>
                              <p className="text-slate-600 leading-relaxed">
                                {quiz.explanation}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
