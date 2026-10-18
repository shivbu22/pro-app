"use client";

import React, { useState } from "react";
import { Sparkles, Send, CheckCircle2, XCircle, Wand2, RefreshCw } from "lucide-react";
import { TimelineProject, EditProposal } from "@omnicut/shared-types";
import { parseNaturalLanguageEdit, applyEditProposal } from "@omnicut/ai-director";

interface AIDirectorBarProps {
  project: TimelineProject;
  onUpdateProject: (updated: TimelineProject) => void;
}

export const AIDirectorBar: React.FC<AIDirectorBarProps> = ({ project, onUpdateProject }) => {
  const [prompt, setPrompt] = useState("");
  const [activeProposal, setActiveProposal] = useState<EditProposal | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const quickPrompts = [
    "Color grade moody teal & orange",
    "Cut 2 seconds off Scene 1",
    "Insert Stat Counter milestone",
    "Auto-sync kinetic captions"
  ];

  const handleSendPrompt = (textToSend?: string) => {
    const text = textToSend || prompt;
    if (!text.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const proposal = parseNaturalLanguageEdit(text, project);
      setActiveProposal(proposal);
      setIsProcessing(false);
      setPrompt("");
    }, 400);
  };

  const handleApprove = () => {
    if (!activeProposal) return;
    const updated = applyEditProposal(project, activeProposal);
    onUpdateProject(updated);
    setActiveProposal(null);
  };

  const handleReject = () => {
    setActiveProposal(null);
  };

  return (
    <div className="bg-[#090a0f] border-t border-[#161922] px-3 py-1.5 flex flex-col space-y-1.5 select-none">
      {/* Proposal Review Banner */}
      {activeProposal && (
        <div className="bg-[#121624] border border-[#3b63ff]/40 rounded p-2 flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded bg-[#3b63ff]/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#9fb4ff]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">
                AI Director: <span className="text-slate-300 font-normal">"{activeProposal.userPrompt}"</span>
              </p>
              <p className="text-[10px] text-slate-400">{activeProposal.summary}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleReject}
              className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition flex items-center space-x-1"
            >
              <XCircle className="w-3 h-3" />
              <span>Dismiss</span>
            </button>
            <button
              onClick={handleApprove}
              className="px-2.5 py-0.5 bg-[#3b63ff] hover:bg-[#4a70ff] text-white rounded text-[11px] font-medium shadow-sm transition flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Single-Row Prompt Bar with Integrated Quick Suggestions */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-[#3b63ff]">
            <Wand2 className="w-3.5 h-3.5" />
          </div>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendPrompt();
            }}
            placeholder="AI Director: 'Cut silence at 0:14', 'Color grade teal & orange', 'Speed up Scene 2'..."
            className="w-full bg-[#0e1017] border border-[#1a1d28] focus:border-[#3b63ff] focus:ring-1 focus:ring-[#3b63ff] rounded pl-8 pr-16 py-1 text-xs text-slate-200 placeholder:text-slate-500 transition font-sans"
          />

          <div className="absolute inset-y-0 right-2 flex items-center space-x-1 text-[9px] text-slate-500 font-mono pointer-events-none">
            <kbd className="bg-[#171a24] px-1 rounded border border-white/5 text-slate-400">Ctrl</kbd>
            <kbd className="bg-[#171a24] px-1 rounded border border-white/5 text-slate-400">K</kbd>
          </div>
        </div>

        {/* Quiet Quick Suggestion Micro-Pills */}
        <div className="hidden xl:flex items-center space-x-1">
          {quickPrompts.slice(0, 2).map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(qp)}
              className="px-2 py-0.5 rounded bg-[#0e1017] border border-[#1a1d28] text-[10px] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition"
            >
              {qp}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleSendPrompt()}
          disabled={!prompt.trim() || isProcessing}
          className="bg-[#3b63ff] hover:bg-[#4a70ff] disabled:opacity-30 text-white font-medium px-3 py-1 rounded text-xs shadow-sm flex items-center space-x-1 transition"
        >
          {isProcessing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          <span>Direct</span>
        </button>
      </div>
    </div>
  );
};
