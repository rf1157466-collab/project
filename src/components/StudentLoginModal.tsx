import React, { useState } from "react";
import {
  X,
  User,
  CheckCircle2,
  Cloud,
  Download,
  Upload,
  LogIn,
  LogOut,
  Save,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

export interface StudentProfile {
  name: string;
  studentId: string;
  email: string;
  university: string;
  isLoggedIn: boolean;
  lastSavedAt: string;
}

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onExportProgress: () => void;
  onImportProgress: (jsonString: string) => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onExportProgress,
  onImportProgress,
}) => {
  const [name, setName] = useState(profile.name);
  const [studentId, setStudentId] = useState(profile.studentId);
  const [email, setEmail] = useState(profile.email);
  const [university, setUniversity] = useState(profile.university);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || "Student",
      studentId: studentId.trim() || "STU-2026-001",
      email: email.trim(),
      university: university.trim() || "University",
      isLoggedIn: true,
      lastSavedAt: new Date().toLocaleTimeString(),
    });
    onClose();
  };

  const handleToggleLogin = () => {
    onUpdateProfile({
      ...profile,
      isLoggedIn: !profile.isLoggedIn,
      lastSavedAt: new Date().toLocaleTimeString(),
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportProgress(text);
        setImportStatus("Progress successfully restored from backup!");
        setTimeout(() => setImportStatus(null), 3500);
      } catch (err) {
        setImportStatus("Failed to restore progress: Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Student Account &amp; Cloud Sync
              </h3>
              <p className="text-xs text-slate-500">
                Save and sync your study sessions, goals, and schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
            <div>
              <span className="font-bold">Progress Saved &amp; Synced</span>
              <span className="block text-[11px] text-emerald-700">
                Auto-saved locally at {profile.lastSavedAt || "Just now"}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 font-bold text-[10px]">
            ACTIVE
          </span>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Student Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="UNIV-2026-88"
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                University
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="State University"
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Student Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rf1157466@gmail.com"
              className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleToggleLogin}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              {profile.isLoggedIn ? (
                <>
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Switch Profile</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Log In</span>
                </>
              )}
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>

        {/* Progress Backup Export & Restore */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Save &amp; Restore Progress Backup
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onExportProgress}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              title="Download your full study data, notes, and goals as a JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export Progress</span>
            </button>

            <label className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Restore Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <p className="text-xs text-indigo-700 font-semibold text-center pt-1 animate-in fade-in">
              {importStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
