import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Plus,
  Save,
  Check,
  FileText,
  Sparkles,
  RefreshCw,
  Target,
  Trophy,
  Upload,
  FileUp,
  Download,
  FileDown,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { INITIAL_NOTES, ModuleGoal, calculateGoalProgress } from "../utils/synapseLogic";
import { generateNotesSummaryPdf, extractTextFromFile } from "../utils/pdfHelper";

interface ModuleVaultTabProps {
  modules: string[];
  selectedModule: string;
  setSelectedModule: (mod: string) => void;
  notes: Record<string, string>;
  onSaveNotes: (mod: string, text: string) => void;
  onAddModule: (newMod: string) => void;
  onRenameModule: (oldName: string, newName: string) => void;
  onDeleteModule: (mod: string) => void;
  studyCount: number;
  goal: ModuleGoal;
  onUpdateGoal: (mod: string, goal: ModuleGoal) => void;
}

export const ModuleVaultTab: React.FC<ModuleVaultTabProps> = ({
  modules,
  selectedModule,
  setSelectedModule,
  notes,
  onSaveNotes,
  onAddModule,
  onRenameModule,
  onDeleteModule,
  studyCount,
  goal,
  onUpdateGoal,
}) => {
  const [currentText, setCurrentText] = useState(
    notes[selectedModule] || ""
  );
  const [newModuleName, setNewModuleName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState(selectedModule);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync editor if external module selection changes
  useEffect(() => {
    setCurrentText(notes[selectedModule] || "");
    setSaveSuccess(false);
    setUploadMsg(null);
  }, [selectedModule, notes]);

  const handleSave = () => {
    onSaveNotes(selectedModule, currentText);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportPdf = () => {
    if (!currentText.trim()) return;
    generateNotesSummaryPdf(selectedModule, currentText);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const result = await extractTextFromFile(file);
      // If notes are already present, append; otherwise set
      const updatedNotes = currentText.trim()
        ? `${currentText}\n\n${result.text}`
        : result.text;
      setCurrentText(updatedNotes);
      onSaveNotes(selectedModule, updatedNotes);
      setUploadMsg(`Imported ${file.name} (${result.wordCount} words extracted)!`);
      setTimeout(() => setUploadMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setUploadMsg(`Error extracting text from ${file.name}`);
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newModuleName.trim();
    if (trimmed) {
      onAddModule(trimmed);
      setNewModuleName("");
      setShowAddModal(false);
    }
  };

  const handleOpenRename = () => {
    setRenameInputValue(selectedModule);
    setShowRenameModal(true);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = renameInputValue.trim();
    if (clean && clean !== selectedModule) {
      onRenameModule(selectedModule, clean);
    }
    setShowRenameModal(false);
  };

  const handleDeleteCurrentModule = () => {
    if (modules.length <= 1) return;
    onDeleteModule(selectedModule);
    setShowDeleteConfirm(false);
  };

  const loadPresetNotes = (key: string) => {
    if (INITIAL_NOTES[key]) {
      setCurrentText(INITIAL_NOTES[key]);
      onSaveNotes(selectedModule, INITIAL_NOTES[key]);
    }
  };

  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  const charCount = currentText.length;

  const currentGoal = goal || { target: 5, timeframe: "weekly" };
  const { percentage, isCompleted, remaining } = calculateGoalProgress(
    studyCount,
    currentGoal.target
  );

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
              <BookOpen className="w-4 h-4" />
              <span>TAB 1: Module Vault</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Course Notes &amp; Syllabus Repository
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Maintain course syllabi, set weekly or monthly study goals, and monitor completion progress. All saved notes feed directly into the AI Cram Station and calibrate study recommendations.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Module</span>
          </button>
        </div>
      </div>

      {/* NEW: Study Goal Configuration & Progress Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Study Goal for: <span className="text-indigo-600">{selectedModule}</span>
            </h3>
          </div>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              Goal Completed! 🎉
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              🎯 {remaining} more {remaining === 1 ? "session" : "sessions"} to reach your goal
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Timeframe Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Goal Timeframe:
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() =>
                  onUpdateGoal(selectedModule, {
                    ...currentGoal,
                    timeframe: "weekly",
                  })
                }
                className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  currentGoal.timeframe === "weekly"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateGoal(selectedModule, {
                    ...currentGoal,
                    timeframe: "monthly",
                  })
                }
                className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  currentGoal.timeframe === "monthly"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Target Sessions Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Target Sessions:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={40}
                value={currentGoal.target}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  onUpdateGoal(selectedModule, {
                    ...currentGoal,
                    target: val,
                  });
                }}
                className="w-24 px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">
                sessions / {currentGoal.timeframe}
              </span>
            </div>
          </div>

          {/* Progress Bar & Stats */}
          <div className="space-y-1.5 sm:col-span-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">
                Progress ({studyCount} / {currentGoal.target})
              </span>
              <span
                className={`font-mono font-bold ${
                  isCompleted ? "text-emerald-600" : "text-indigo-600"
                }`}
              >
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Module Modal / Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add Course Module
            </h3>
            <p className="text-xs text-slate-500">
              Enter the course name (e.g. Organic Chemistry, Quantum Mechanics).
            </p>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Linear Algebra & Matrices"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newModuleName.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Module Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-indigo-600" />
              Rename Course Module
            </h3>
            <p className="text-xs text-slate-500">
              Update the name of <strong>{selectedModule}</strong>. All saved study counts, goals, and notes will be transferred automatically.
            </p>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  New Module Name:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={renameInputValue}
                  onChange={(e) => setRenameInputValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameInputValue.trim() || renameInputValue.trim() === selectedModule}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  Save New Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Module Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-rose-200 space-y-4">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Course Module?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{selectedModule}</strong>? This will delete its study counters, goals, and notes.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Keep Subject
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrentModule}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
        {/* Module Selector Bar & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center flex-wrap gap-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
              Module:
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
            >
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Rename Subject Button */}
            <button
              type="button"
              onClick={handleOpenRename}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Change name of this subject"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Rename</span>
            </button>

            {/* Delete Subject Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={modules.length <= 1}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              title={modules.length <= 1 ? "At least one module must remain" : "Delete this subject"}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete</span>
            </button>

            {/* Total count badge */}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {modules.length} {modules.length === 1 ? "Subject" : "Subjects"} Registered
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Preset Notes:
            </span>
            <button
              onClick={() => loadPresetNotes("Physics / Mechanics")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              title="Load realistic Newton's Laws & Mechanics notes"
            >
              Newton's Laws
            </button>
            <button
              onClick={() => loadPresetNotes("Calculus & Analysis")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              title="Load Calculus & Integration by Parts notes"
            >
              Calculus
            </button>
            <button
              onClick={() => loadPresetNotes("Algorithms & Data Structures")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              title="Load Algorithms & Dynamic Programming notes"
            >
              Algorithms
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Lecture Notes &amp; Proofs for: {selectedModule}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
            </div>
          </div>

          <textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            rows={14}
            placeholder="Paste your lecture notes, equations, proofs, or textbook summaries here..."
            className="w-full font-mono text-xs sm:text-sm p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 leading-relaxed text-slate-800"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              Recorded Sessions: <strong>{studyCount}</strong>
            </span>
            {uploadMsg && (
              <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {uploadMsg}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.md"
              className="hidden"
            />

            {/* Upload PDF / Document Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Upload lecture notes PDF or text file"
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Reading PDF...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upload PDF / File</span>
                </>
              )}
            </button>

            {/* Export Summary PDF Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={!currentText.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Generate and download a PDF containing important formulas & definitions"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export Summary PDF</span>
            </button>

            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" /> Saved!
              </span>
            )}

            {/* Save Notes Button */}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Notes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
