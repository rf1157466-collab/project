import React from "react";
import { Brain, FileCode, Sparkles, AlertCircle, User, Cloud } from "lucide-react";
import { StudentProfile } from "./StudentLoginModal";

interface HeaderProps {
  neglectedModule: string;
  neglectedCount: number;
  onOpenPythonModal: () => void;
  actionMessage: string | null;
  profile: StudentProfile;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  neglectedModule,
  neglectedCount,
  onOpenPythonModal,
  actionMessage,
  profile,
  onOpenLoginModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Synapse
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Adaptive AI Study
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Streamlit + Gemini 1.5
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Adaptive AI Study & Time-Management System for University Students
              </p>
            </div>
          </div>

          {/* Right HUD: Neglected Module Status, Student Login Button & Python Source button */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 block leading-tight">
                  Priority Focus (Lowest Study)
                </span>
                <span className="font-semibold text-slate-900">
                  {neglectedModule} <span className="text-amber-700 font-bold">({neglectedCount} sessions)</span>
                </span>
              </div>
            </div>

            {/* Student Login & Cloud Save Button */}
            <button
              onClick={onOpenLoginModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-all cursor-pointer shadow-2xs"
              title="Student Login & Cloud Progress Sync"
            >
              <div className="relative">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="text-left">
                <div className="leading-tight flex items-center gap-1">
                  <span>{profile.isLoggedIn ? profile.name : "Student Login"}</span>
                  <Cloud className="w-3 h-3 text-emerald-600 inline" />
                </div>
                <span className="text-[9px] text-indigo-600 font-mono block leading-none">
                  {profile.studentId || "Save Progress"}
                </span>
              </div>
            </button>

            <button
              onClick={onOpenPythonModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
              title="View single-file Python Streamlit code & terminal commands"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>app.py Code</span>
            </button>
          </div>
        </div>

        {/* Action toast banner if triggered */}
        {actionMessage && (
          <div className="mt-2.5 px-3.5 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{actionMessage}</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono">
              Schedule Updated ⚡
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
