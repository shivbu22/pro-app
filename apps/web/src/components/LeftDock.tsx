"use client";

import React, { useState } from "react";
import { Folder, FileText, Volume2 } from "lucide-react";
import { TimelineProject, Clip } from "@omnicut/shared-types";
import { ProjectBin } from "./ProjectBin";
import { TranscriptEditor } from "./TranscriptEditor";
import { ScriptPanel } from "./ScriptPanel";

interface LeftDockProps {
  project: TimelineProject;
  onUpdateProject: (updated: TimelineProject) => void;
  onSeekFrame: (frame: number) => void;
  onClose?: () => void;
}

export const LeftDock: React.FC<LeftDockProps> = ({
  project,
  onUpdateProject,
  onSeekFrame,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"bin" | "transcript" | "script">("bin");

  return (
    <div className="h-full flex flex-col bg-[#0b0d13] border-r border-[#161922] select-none overflow-hidden">
      {/* Dock Header Tabs */}
      <div className="h-8 bg-[#090b10] border-b border-[#161922] flex items-center justify-between px-2 text-xs">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab("bin")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeTab === "bin"
                ? "bg-[#161924] text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Folder className="w-3 h-3 text-[#3b63ff]" />
            <span>Bin</span>
          </button>

          <button
            onClick={() => setActiveTab("transcript")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeTab === "transcript"
                ? "bg-[#161924] text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span>Transcript</span>
          </button>

          <button
            onClick={() => setActiveTab("script")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeTab === "script"
                ? "bg-[#161924] text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3 h-3 text-emerald-400" />
            <span>Script</span>
          </button>
        </div>
      </div>

      {/* Dock Body Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "bin" && (
          <ProjectBin
            project={project}
            onInsertClipToTimeline={(clip: Clip) => {
              const targetTrack = project.tracks.find((t) => t.type === (clip.type === "video" ? "video" : "audio"));
              if (!targetTrack) return;
              const updated = {
                ...project,
                tracks: project.tracks.map((t) =>
                  t.id === targetTrack.id
                    ? { ...t, clips: [...t.clips, { ...clip, startFrame: project.currentFrame }] }
                    : t
                )
              };
              onUpdateProject(updated);
            }}
          />
        )}

        {activeTab === "transcript" && (
          <TranscriptEditor
            project={project}
            onSeekFrame={onSeekFrame}
            onUpdateProject={onUpdateProject}
          />
        )}

        {activeTab === "script" && (
          <ScriptPanel
            project={project}
            onSeekFrame={onSeekFrame}
          />
        )}
      </div>
    </div>
  );
};
