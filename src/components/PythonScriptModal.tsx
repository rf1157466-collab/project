import React, { useState } from "react";
import { X, Copy, Check, Download, Terminal, FileCode, ExternalLink } from "lucide-react";

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  appPyCode: string;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  isOpen,
  onClose,
  appPyCode,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const terminalCommand = "pip install streamlit google-generativeai pandas\nstreamlit run app.py";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appPyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(terminalCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([appPyCode], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "app.py";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>app.py</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Single-File Python Streamlit
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Complete, fully functional code with Google Gemini API integration and Adaptive Schedule loop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download app.py</span>
            </button>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Terminal Run Guide */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Terminal Installation &amp; Launch Commands:
            </span>
            <button
              onClick={handleCopyCmd}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd ? "Copied Command!" : "Copy Commands"}
            </button>
          </div>
          <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-emerald-400">
            <div><span className="text-slate-500">$</span> pip install streamlit google-generativeai pandas</div>
            <div><span className="text-slate-500">$</span> streamlit run app.py</div>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 font-mono text-xs bg-slate-950 text-slate-300 whitespace-pre leading-relaxed select-text">
          {appPyCode}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-800/60 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <span>Saved to project root: <strong className="text-slate-200">/app.py</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
