/**
 * Synapse: Adaptive AI Study & Time-Management System
 * Interactive React Web Application mirroring the single-file Streamlit app.py
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ModuleVaultTab } from "./components/ModuleVaultTab";
import { CramStationTab } from "./components/CramStationTab";
import { SmartScheduleTab } from "./components/SmartScheduleTab";
import { PythonScriptModal } from "./components/PythonScriptModal";
import { StudentLoginModal, StudentProfile } from "./components/StudentLoginModal";
import {
  INITIAL_MODULES,
  INITIAL_STUDY_COUNTS,
  INITIAL_GOALS,
  INITIAL_NOTES,
  getNeglectedModule,
  incrementStudyCount,
  ModuleGoal,
  didJustAchieveGoal,
  renameModuleData,
  deleteModuleData,
} from "./utils/synapseLogic";
import appPyRaw from "../app.py?raw";

export default function App() {
  // State initialization matching st.session_state
  const [modules, setModules] = useState<string[]>(() => {
    const saved = localStorage.getItem("synapse_modules");
    return saved ? JSON.parse(saved) : INITIAL_MODULES;
  });

  const [studyCounts, setStudyCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("synapse_study_counts");
    return saved ? JSON.parse(saved) : INITIAL_STUDY_COUNTS;
  });

  const [studyGoals, setStudyGoals] = useState<Record<string, ModuleGoal>>(() => {
    const saved = localStorage.getItem("synapse_study_goals");
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [scheduleOverrides, setScheduleOverrides] = useState<
    Record<string, Partial<Record<string, string>>>
  >(() => {
    const saved = localStorage.getItem("synapse_schedule_overrides");
    return saved ? JSON.parse(saved) : {};
  });

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("synapse_notes");
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [selectedModule, setSelectedModule] = useState<string>(
    "Physics / Mechanics"
  );
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [apiKey, setApiKey] = useState<string>("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("synapse_student_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      name: "Alex Rivera",
      studentId: "UNIV-2026-8841",
      email: "rf1157466@gmail.com",
      university: "State University / College of Engineering",
      isLoggedIn: true,
      lastSavedAt: new Date().toLocaleTimeString(),
    };
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("synapse_modules", JSON.stringify(modules));
  }, [modules]);

  useEffect(() => {
    localStorage.setItem("synapse_study_counts", JSON.stringify(studyCounts));
  }, [studyCounts]);

  useEffect(() => {
    localStorage.setItem("synapse_study_goals", JSON.stringify(studyGoals));
  }, [studyGoals]);

  useEffect(() => {
    localStorage.setItem(
      "synapse_schedule_overrides",
      JSON.stringify(scheduleOverrides)
    );
  }, [scheduleOverrides]);

  useEffect(() => {
    localStorage.setItem("synapse_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("synapse_student_profile", JSON.stringify(studentProfile));
  }, [studentProfile]);

  // Adaptive Loop Engine calculation
  const { module: neglectedModule, count: neglectedCount } = getNeglectedModule(
    modules,
    studyCounts
  );

  // CRITICAL FEATURE: Handle study counter increment and goal achievement
  const handleLogStudySession = (moduleName: string) => {
    const prev = studyCounts[moduleName] ?? 0;
    const next = prev + 1;
    setStudyCounts((c) => incrementStudyCount(c, moduleName));

    const goal = studyGoals[moduleName] || { target: 5, timeframe: "weekly" };
    if (didJustAchieveGoal(prev, next, goal.target)) {
      const celebrationMsg = `🎉 Milestone Achieved! You reached your ${goal.timeframe} goal of ${goal.target} sessions for ${moduleName}! 🏆`;
      setActionMessage(celebrationMsg);
      setTimeout(() => {
        setActionMessage((curr) => (curr === celebrationMsg ? null : curr));
      }, 6000);
    } else {
      const msg = `Logged 1 study session for ${moduleName}!`;
      setActionMessage(msg);
      setTimeout(() => {
        setActionMessage((curr) => (curr === msg ? null : curr));
      }, 4500);
    }
  };

  const handleIncrementCount = (moduleName: string) => {
    handleLogStudySession(moduleName);
  };

  const handleDecrementCount = (moduleName: string) => {
    setStudyCounts((prev) => {
      const curr = prev[moduleName] ?? 0;
      if (curr <= 0) return prev;
      return { ...prev, [moduleName]: curr - 1 };
    });
  };

  const handleSaveNotes = (moduleName: string, text: string) => {
    setNotes((prev) => ({
      ...prev,
      [moduleName]: text,
    }));
  };

  const handleUpdateGoal = (moduleName: string, newGoal: ModuleGoal) => {
    setStudyGoals((prev) => ({
      ...prev,
      [moduleName]: newGoal,
    }));
  };

  const handleUpdateLecture = (
    timeSlot: string,
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
    newLecture: string
  ) => {
    setScheduleOverrides((prev) => ({
      ...prev,
      [timeSlot]: {
        ...prev[timeSlot],
        [day]: newLecture,
      },
    }));
    setActionMessage(`Updated ${day.toUpperCase()} (${timeSlot}) to: ${newLecture}`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleResetSchedule = () => {
    setScheduleOverrides({});
    setActionMessage("Reset weekly schedule back to standard university timetable.");
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleAddModule = (newMod: string) => {
    if (!modules.includes(newMod)) {
      setModules((prev) => [...prev, newMod]);
      setStudyCounts((prev) => ({ ...prev, [newMod]: 0 }));
      setStudyGoals((prev) => ({
        ...prev,
        [newMod]: { target: 4, timeframe: "weekly" },
      }));
      setNotes((prev) => ({
        ...prev,
        [newMod]: `### Notes for ${newMod}\nPaste lecture content here...`,
      }));
      setSelectedModule(newMod);
      setActionMessage(`Created new course module: ${newMod}`);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleRenameModule = (oldName: string, newName: string) => {
    const updated = renameModuleData(
      oldName,
      newName,
      modules,
      studyCounts,
      studyGoals,
      notes
    );
    setModules(updated.modules);
    setStudyCounts(updated.studyCounts);
    setStudyGoals(updated.goals);
    setNotes(updated.notes);
    if (selectedModule === oldName) {
      setSelectedModule(newName.trim());
    }
    setActionMessage(`Renamed "${oldName}" to "${newName.trim()}"!`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleDeleteModule = (moduleToDelete: string) => {
    const updated = deleteModuleData(
      moduleToDelete,
      modules,
      studyCounts,
      studyGoals,
      notes
    );
    setModules(updated.modules);
    setStudyCounts(updated.studyCounts);
    setStudyGoals(updated.goals);
    setNotes(updated.notes);
    if (selectedModule === moduleToDelete) {
      setSelectedModule(updated.modules[0] || "");
    }
    setActionMessage(`Removed module: ${moduleToDelete}`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleExportProgress = () => {
    const backupData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      studentProfile,
      modules,
      studyCounts,
      studyGoals,
      scheduleOverrides,
      notes,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `synapse_progress_${studentProfile.studentId || "student"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportProgress = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.modules && Array.isArray(parsed.modules)) {
        setModules(parsed.modules);
        if (parsed.modules.length > 0) {
          setSelectedModule(parsed.modules[0]);
        }
      }
      if (parsed.studyCounts && typeof parsed.studyCounts === "object") {
        setStudyCounts(parsed.studyCounts);
      }
      if (parsed.studyGoals && typeof parsed.studyGoals === "object") {
        setStudyGoals(parsed.studyGoals);
      }
      if (parsed.notes && typeof parsed.notes === "object") {
        setNotes(parsed.notes);
      }
      if (parsed.scheduleOverrides && typeof parsed.scheduleOverrides === "object") {
        setScheduleOverrides(parsed.scheduleOverrides);
      }
      if (parsed.studentProfile && typeof parsed.studentProfile === "object") {
        setStudentProfile(parsed.studentProfile);
      }
      setActionMessage("Progress backup restored successfully! 🚀");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setActionMessage("Failed to restore backup: Invalid JSON file.");
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const handleResetToDefaults = () => {
    setModules(INITIAL_MODULES);
    setStudyCounts(INITIAL_STUDY_COUNTS);
    setStudyGoals(INITIAL_GOALS);
    setNotes(INITIAL_NOTES);
    setSelectedModule("Physics / Mechanics");
    setActionMessage("Reset study counters and goals to default: Calculus (4/5), Algorithms (1/4), Physics (0/3)");
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleSwitchToCram = (moduleName: string) => {
    setSelectedModule(moduleName);
    setActiveTab(2);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        neglectedModule={neglectedModule}
        neglectedCount={neglectedCount}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        actionMessage={actionMessage}
        profile={studentProfile}
        onOpenLoginModal={() => setIsStudentModalOpen(true)}
      />

      {/* Main Layout: Streamlit-Style Sidebar + Main Area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto shadow-xs">
        {/* Sidebar */}
        <Sidebar
          apiKey={apiKey}
          setApiKey={setApiKey}
          modules={modules}
          studyCounts={studyCounts}
          goals={studyGoals}
          onResetToDefaults={handleResetToDefaults}
          onSelectModule={(mod) => {
            setSelectedModule(mod);
          }}
          selectedModule={selectedModule}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Tab Navigation (Streamlit st.tabs) */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab(1)}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 1
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>📚</span>
              <span>Module Vault</span>
            </button>

            <button
              onClick={() => setActiveTab(2)}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 2
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>⚡</span>
              <span>AI Cram Station</span>
            </button>

            <button
              onClick={() => setActiveTab(3)}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
                activeTab === 3
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>📅</span>
              <span>Adaptive Smart Schedule</span>
              {neglectedCount === 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>
          </div>

          {/* TAB 1: Module Vault */}
          {activeTab === 1 && (
            <ModuleVaultTab
              modules={modules}
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
              notes={notes}
              onSaveNotes={handleSaveNotes}
              onAddModule={handleAddModule}
              onRenameModule={handleRenameModule}
              onDeleteModule={handleDeleteModule}
              studyCount={studyCounts[selectedModule] ?? 0}
              goal={studyGoals[selectedModule] || { target: 5, timeframe: "weekly" }}
              onUpdateGoal={handleUpdateGoal}
            />
          )}

          {/* TAB 2: AI Cram Station */}
          {activeTab === 2 && (
            <CramStationTab
              modules={modules}
              selectedModule={selectedModule}
              setSelectedModule={setSelectedModule}
              notes={notes}
              studyCounts={studyCounts}
              goals={studyGoals}
              onLogStudySession={handleLogStudySession}
              apiKey={apiKey}
            />
          )}

          {/* TAB 3: Adaptive Smart Schedule */}
          {activeTab === 3 && (
            <SmartScheduleTab
              modules={modules}
              studyCounts={studyCounts}
              goals={studyGoals}
              neglectedModule={neglectedModule}
              neglectedCount={neglectedCount}
              scheduleOverrides={scheduleOverrides}
              onUpdateLecture={handleUpdateLecture}
              onResetSchedule={handleResetSchedule}
              onIncrementCount={handleIncrementCount}
              onDecrementCount={handleDecrementCount}
              onSwitchToCram={handleSwitchToCram}
            />
          )}
        </main>
      </div>

      {/* Code & Terminal Modal for Python app.py */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        appPyCode={appPyRaw}
      />

      {/* Student Profile & Cloud Progress Sync Modal */}
      <StudentLoginModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        profile={studentProfile}
        onUpdateProfile={(p) => {
          setStudentProfile(p);
          setActionMessage(`Saved profile for ${p.name}! Cloud sync active. ☁️`);
          setTimeout(() => setActionMessage(null), 3500);
        }}
        onExportProgress={handleExportProgress}
        onImportProgress={handleImportProgress}
      />
    </div>
  );
}
