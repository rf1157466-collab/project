import React, { useState } from "react";
import {
  Key,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Sparkles,
  ChevronRight,
  Info,
  Target,
  Trophy,
} from "lucide-react";
import { ModuleGoal, calculateGoalProgress } from "../utils/synapseLogic";

interface SidebarProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  modules: string[];
  studyCounts: Record<string, number>;
  goals: Record<string, ModuleGoal>;
  onResetToDefaults: () => void;
  onSelectModule: (mod: string) => void;
  selectedModule: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  apiKey,
  setApiKey,
  modules,
  studyCounts,
  goals,
  onResetToDefaults,
  onSelectModule,
  selectedModule,
}) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <aside className="w-full lg:w-72 bg-slate-50 border-r border-slate-200 p-4 sm:p-5 flex flex-col gap-6 shrink-0">
      {/* Brand & Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🧠</span>
          <span className="font-bold text-slate-900 text-base">Synapse Hub</span>
        </div>
        <p className="text-xs text-slate-500">
          Streamlit-style sidebar controller
        </p>
      </div>

      {/* API Key Configuration Section */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span>Google Gemini API</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
            gemini-1.5-flash
          </span>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            API Key:
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Gemini API Key..."
              className="w-full text-xs font-mono px-2.5 py-1.5 pr-12 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {apiKey.trim() ? (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight">
              <strong>Connected:</strong> Gemini 1.5 Flash will be queried for live extraction and quizzes.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight">
              <strong>Demo Mode Active:</strong> Polite warning as required. Pre-filled high-yield formulas & quiz responses are ready so hackathon demos never crash!
            </p>
          </div>
        )}
      </div>

      {/* Live Study Activity Counters & Goals */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            📊 Study Counters &amp; Goals
          </span>
          <button
            onClick={onResetToDefaults}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Reset to hackathon default counts (4, 1, 0)"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {modules.map((mod) => {
            const count = studyCounts[mod] ?? 0;
            const goal = goals[mod] || { target: 5, timeframe: "weekly" };
            const { percentage, isCompleted } = calculateGoalProgress(
              count,
              goal.target
            );
            const isSelected = selectedModule === mod;
            const isZero = count === 0;

            return (
              <div
                key={mod}
                onClick={() => onSelectModule(mod)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 text-xs ${
                  isSelected
                    ? "bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-200"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500"
                          : isZero
                          ? "bg-amber-500 animate-ping"
                          : "bg-indigo-500"
                      }`}
                    />
                    <span className="font-medium text-slate-800 truncate">
                      {mod}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isZero
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {count} / {goal.target}
                    </span>
                  </div>
                </div>

                {/* Progress bar in sidebar item */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isCompleted ? "bg-emerald-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adaptive Loop Insight */}
      <div className="mt-auto bg-gradient-to-br from-indigo-50 to-purple-50 p-3.5 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-950">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>The Adaptive Loop</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          The engine automatically tracks which module is neglected. When you study via the <strong>AI Cram Station</strong>, counters update instantly and dynamically reschedule the 18:00 evening slot!
        </p>
      </div>
    </aside>
  );
};
