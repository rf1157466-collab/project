import React, { useState } from "react";
import {
  Calendar,
  AlertTriangle,
  Zap,
  Clock,
  CheckCircle,
  TrendingDown,
  BarChart3,
  Plus,
  Minus,
  Trophy,
  Target,
  Edit2,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { generateSchedule, ModuleGoal, calculateGoalProgress, ScheduleSlot } from "../utils/synapseLogic";

interface SmartScheduleTabProps {
  modules: string[];
  studyCounts: Record<string, number>;
  goals: Record<string, ModuleGoal>;
  neglectedModule: string;
  neglectedCount: number;
  scheduleOverrides: Record<string, Partial<Record<string, string>>>;
  onUpdateLecture: (
    timeSlot: string,
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
    newLecture: string
  ) => void;
  onResetSchedule: () => void;
  onIncrementCount: (mod: string) => void;
  onDecrementCount: (mod: string) => void;
  onSwitchToCram: (mod: string) => void;
}

export const SmartScheduleTab: React.FC<SmartScheduleTabProps> = ({
  modules,
  studyCounts,
  goals,
  neglectedModule,
  neglectedCount,
  scheduleOverrides,
  onUpdateLecture,
  onResetSchedule,
  onIncrementCount,
  onDecrementCount,
  onSwitchToCram,
}) => {
  const scheduleSlots = generateSchedule(neglectedModule, scheduleOverrides);

  // Editing state for timetable cells
  const [editingCell, setEditingCell] = useState<{
    time: string;
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
    currentValue: string;
  } | null>(null);

  const [editValue, setEditValue] = useState("");

  const startEditing = (
    time: string,
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
    currentValue: string
  ) => {
    setEditingCell({ time, day, currentValue });
    setEditValue(currentValue);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingCell && editValue.trim()) {
      onUpdateLecture(editingCell.time, editingCell.day, editValue.trim());
      setEditingCell(null);
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const days: Array<{
    key: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
    label: string;
  }> = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
              <Calendar className="w-4 h-4" />
              <span>TAB 3: Adaptive Smart Schedule</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Dynamic Timetable &amp; Real-Time Course Rebalancing
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Timetable configured with <strong>08:00 – 12:00</strong> morning lectures and <strong>14:00 – 18:00</strong> afternoon sessions. Click any lecture to edit it freely!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetSchedule}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reset all lecture modifications back to default timetable"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Lectures</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-mono bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>08:00–12:00 &amp; 14:00–18:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal / Floating Editor */}
      {editingCell && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Modify Lecture ({editingCell.day.toUpperCase()} • {editingCell.time})
                </h3>
              </div>
              <button
                onClick={cancelEdit}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Enter your customized course name, recitation room, or lab session for this time slot.
            </p>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="e.g. Organic Chemistry (Lecture Hall 4)"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editValue.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Lecture</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. METRICS & STUDY GOALS SECTION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              📊 Module Study Balance &amp; Goal Progress
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Click +/- to simulate sessions and test adaptive rebalance &amp; goal completion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {modules.map((mod) => {
            const count = studyCounts[mod] ?? 0;
            const isNeglected = mod === neglectedModule;
            const goal = goals[mod] || { target: 5, timeframe: "weekly" };
            const { percentage, isCompleted, remaining } = calculateGoalProgress(
              count,
              goal.target
            );

            return (
              <div
                key={mod}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isNeglected
                    ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-200"
                    : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {mod}
                    </span>
                    {isCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-emerald-600" />
                        Goal Met 🎉
                      </span>
                    ) : isNeglected ? (
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        Lowest Study
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black font-mono text-slate-900">
                        {count}
                      </span>
                      <span className="text-xs text-slate-500">
                        / {goal.target} {goal.timeframe}
                      </span>
                    </div>

                    {/* Interactive Quick-Test Counter Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDecrementCount(mod)}
                        disabled={count <= 0}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-30 cursor-pointer"
                        title="Decrement session"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onIncrementCount(mod)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-indigo-600 cursor-pointer"
                        title="Increment session"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>Goal Progress</span>
                      <span className="font-mono text-indigo-600 font-bold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted
                            ? "bg-emerald-500"
                            : isNeglected
                            ? "bg-amber-500"
                            : "bg-indigo-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span
                    className={
                      isCompleted
                        ? "text-emerald-700 font-semibold"
                        : isNeglected
                        ? "text-amber-800 font-bold"
                        : "text-slate-500"
                    }
                  >
                    {isCompleted
                      ? "Target Achieved!"
                      : isNeglected
                      ? "⚠️ Neglected Course"
                      : `${remaining} session${remaining === 1 ? "" : "s"} left`}
                  </span>
                  <button
                    onClick={() => onSwitchToCram(mod)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    Study &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. THE ADAPTIVE LOOP ENGINE ALERT BOX (CRITICAL REQUIREMENT) */}
      <div className="space-y-3">
        {/* Streamlit st.warning equivalent box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-xs flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 tracking-tight">
              ⚠️ Adaptive Re-balance Triggered: You have neglected {neglectedModule}! The system has dynamically prioritized it.
            </h4>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Based on your study activity log, <strong>{neglectedModule}</strong> currently has the lowest engagement ({neglectedCount} {neglectedCount === 1 ? "session" : "sessions"}). Synapse has automatically updated the weekly schedule by assigning mandatory 60-minute evening revision sessions.
            </p>
          </div>
        </div>

        {/* Dynamic injection explanation pill */}
        <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="font-semibold">
              Evening Free Slot (18:00 – 19:00): Overridden with 60-Min Revision for {neglectedModule}
            </span>
          </div>
          <span className="text-[11px] font-mono text-indigo-200">
            Real-Time Slot Injected
          </span>
        </div>
      </div>

      {/* 3. VISUAL SCHEDULE TABLE (Monday to Friday) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Weekly Academic Schedule</span>
              <span className="text-[11px] font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                ✏️ Click any lecture to edit
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Morning Curricula (08:00 – 12:00), Afternoon Curricula (14:00 – 18:00), and Dynamic AI Evening Revision (18:00 – 19:00)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              Editable Lectures
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Dynamic Slot (18:00 - 19:00)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-32 shrink-0">Time Slot</th>
                <th className="py-3 px-3">Monday</th>
                <th className="py-3 px-3">Tuesday</th>
                <th className="py-3 px-3">Wednesday</th>
                <th className="py-3 px-3">Thursday</th>
                <th className="py-3 px-3">Friday</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduleSlots.map((slot, idx) => {
                const isDynamic = slot.isDynamicSlot;

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isDynamic
                        ? "bg-amber-100/60 font-semibold text-amber-950 hover:bg-amber-100"
                        : "hover:bg-slate-50/70 text-slate-800"
                    }`}
                  >
                    <td
                      className={`py-3 px-4 font-mono font-bold whitespace-nowrap ${
                        isDynamic ? "text-amber-900" : "text-slate-600"
                      }`}
                    >
                      {slot.time}
                    </td>

                    {/* Monday */}
                    <td className="py-2.5 px-3">
                      {isDynamic ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold border border-amber-300">
                          <Zap className="w-3 h-3 text-amber-700 fill-amber-700" />
                          {slot.monday}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(slot.time, "monday", slot.monday)}
                          className="w-full text-left group p-1.5 -m-1.5 rounded-lg hover:bg-indigo-50/60 hover:text-indigo-900 transition-colors flex items-center justify-between gap-1 cursor-pointer"
                          title="Click to edit lecture"
                        >
                          <span>{slot.monday}</span>
                          <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      )}
                    </td>

                    {/* Tuesday */}
                    <td className="py-2.5 px-3">
                      {isDynamic ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold border border-amber-300">
                          <Zap className="w-3 h-3 text-amber-700 fill-amber-700" />
                          {slot.tuesday}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(slot.time, "tuesday", slot.tuesday)}
                          className="w-full text-left group p-1.5 -m-1.5 rounded-lg hover:bg-indigo-50/60 hover:text-indigo-900 transition-colors flex items-center justify-between gap-1 cursor-pointer"
                          title="Click to edit lecture"
                        >
                          <span>{slot.tuesday}</span>
                          <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      )}
                    </td>

                    {/* Wednesday */}
                    <td className="py-2.5 px-3">
                      {isDynamic ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold border border-amber-300">
                          <Zap className="w-3 h-3 text-amber-700 fill-amber-700" />
                          {slot.wednesday}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(slot.time, "wednesday", slot.wednesday)}
                          className="w-full text-left group p-1.5 -m-1.5 rounded-lg hover:bg-indigo-50/60 hover:text-indigo-900 transition-colors flex items-center justify-between gap-1 cursor-pointer"
                          title="Click to edit lecture"
                        >
                          <span>{slot.wednesday}</span>
                          <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      )}
                    </td>

                    {/* Thursday */}
                    <td className="py-2.5 px-3">
                      {isDynamic ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold border border-amber-300">
                          <Zap className="w-3 h-3 text-amber-700 fill-amber-700" />
                          {slot.thursday}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(slot.time, "thursday", slot.thursday)}
                          className="w-full text-left group p-1.5 -m-1.5 rounded-lg hover:bg-indigo-50/60 hover:text-indigo-900 transition-colors flex items-center justify-between gap-1 cursor-pointer"
                          title="Click to edit lecture"
                        >
                          <span>{slot.thursday}</span>
                          <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      )}
                    </td>

                    {/* Friday */}
                    <td className="py-2.5 px-3">
                      {isDynamic ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold border border-amber-300">
                          <Zap className="w-3 h-3 text-amber-700 fill-amber-700" />
                          {slot.friday}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(slot.time, "friday", slot.friday)}
                          className="w-full text-left group p-1.5 -m-1.5 rounded-lg hover:bg-indigo-50/60 hover:text-indigo-900 transition-colors flex items-center justify-between gap-1 cursor-pointer"
                          title="Click to edit lecture"
                        >
                          <span>{slot.friday}</span>
                          <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            💡 <strong>Customizable Schedule:</strong> Click on any class above to edit its course name or location. Evening slot (18:00 – 19:00) automatically rebalances based on study counts.
          </span>
          <button
            onClick={() => onSwitchToCram(neglectedModule)}
            className="text-indigo-600 hover:text-indigo-800 font-bold underline shrink-0 cursor-pointer"
          >
            Cram {neglectedModule} Now &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
