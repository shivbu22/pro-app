"use client";

import React from "react";
import { 
  Film, Sparkles, Download, Settings, Undo2, Redo2, Sliders, Palette, Volume2, Wand2,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Tv, Smartphone
} from "lucide-react";
import { AspectRatio } from "@omnicut/shared-types";

export type WorkspaceMode = "edit" | "color" | "audio" | "ai";

interface TopMenuBarProps {
  projectTitle: string;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  activeWorkspace: WorkspaceMode;
  onWorkspaceChange: (ws: WorkspaceMode) => void;
  onOpenOnePromptModal: () => void;
  onOpenExportModal: () => void;
  onOpenSettings: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showInspector: boolean;
  onToggleInspector: () => void;
  showLeftDock: boolean;
  onToggleLeftDock: () => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({
  projectTitle,
  aspectRatio,
  onAspectRatioChange,
  activeWorkspace,
  onWorkspaceChange,
  onOpenOnePromptModal,
  onOpenExportModal,
  onOpenSettings,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showInspector,
  onToggleInspector,
  showLeftDock,
  onToggleLeftDock
}) => {
  return (
    <header className="h-11 bg-[#090b10] border-b border-[#161922] flex items-center justify-between px-3 text-xs select-none">
      {/* Left: App Brand & Panel Toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleLeftDock}
          className={`p-1.5 rounded transition ${
            showLeftDock ? "text-slate-300 hover:bg-white/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
          }`}
          title={showLeftDock ? "Hide Media Bin (Zen Mode)" : "Show Media Bin"}
        >
          {showLeftDock ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-[#3b63ff] flex items-center justify-center shadow-[0_0_10px_rgba(59,99,255,0.4)]">
            <Film className="w-3 h-3 text-white" />
          </div>
          <span className="text-[13px] tracking-tight font-bold text-white">
            OmniCut
          </span>
        </div>

        {/* Studio Workspace Tabs - Clean Muted Desktop Look */}
        <div className="hidden md:flex items-center bg-[#0e1017] p-0.5 rounded border border-[#1a1d28] ml-2">
          {[
            { id: "edit", label: "Edit" },
            { id: "color", label: "Color" },
            { id: "audio", label: "Audio" },
            { id: "ai", label: "AI Director" }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onWorkspaceChange(mode.id as WorkspaceMode)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                activeWorkspace === mode.id
                  ? "bg-[#1c202d] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Sequence Title & Aspect Ratio */}
      <div className="flex items-center space-x-2 bg-[#0e1017] px-2.5 py-1 rounded border border-[#1a1d28]">
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-slate-300 truncate max-w-[200px] font-mono text-[11px]">
            {projectTitle}
          </span>
        </div>
        <span className="text-slate-600">/</span>
        <div className="flex items-center space-x-0.5 bg-[#090b10] p-0.5 rounded border border-[#171a24]">
          <button
            onClick={() => onAspectRatioChange("16:9")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 transition ${
              aspectRatio === "16:9"
                ? "bg-[#3b63ff] text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="16:9 Widescreen (YouTube Master)"
          >
            <Tv className="w-2.5 h-2.5" />
            <span>16:9</span>
          </button>
          <button
            onClick={() => onAspectRatioChange("9:16")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 transition ${
              aspectRatio === "9:16"
                ? "bg-[#3b63ff] text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="9:16 Vertical (Shorts / Reels)"
          >
            <Smartphone className="w-2.5 h-2.5" />
            <span>9:16</span>
          </button>
        </div>
      </div>

      {/* Right: Actions, Undo, 1-Prompt, Inspector, Export */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-0.5 mr-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-25"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-25"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1-Prompt Video */}
        <button
          onClick={onOpenOnePromptModal}
          className="flex items-center space-x-1.5 bg-[#171a26] hover:bg-[#202434] text-slate-200 border border-[#252a3b] font-medium px-2.5 py-1 rounded transition text-[11px]"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>1-Prompt Video</span>
        </button>

        {/* Inspector Toggle */}
        <button
          onClick={onToggleInspector}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-medium border transition ${
            showInspector
              ? "bg-[#3b63ff]/15 border-[#3b63ff]/40 text-[#9fb4ff]"
              : "bg-[#0e1017] border-[#1a1d28] text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle Clip Inspector Panel"
        >
          <Sliders className="w-3 h-3" />
          <span>Inspector</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="AI Provider Settings"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Export Button - Clean Minimalist Accent */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center space-x-1.5 bg-[#3b63ff] hover:bg-[#4a70ff] text-white font-semibold px-3 py-1 rounded shadow-sm transition text-[11px]"
        >
          <Download className="w-3 h-3" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
