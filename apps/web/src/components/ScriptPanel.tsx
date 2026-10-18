"use client";

import React from "react";
import { FileText, Sparkles, Clock, Video, Eye, ChevronRight } from "lucide-react";
import { TimelineProject } from "@omnicut/shared-types";

interface ScriptPanelProps {
  project: TimelineProject;
  onSeekFrame: (frame: number) => void;
}

export const ScriptPanel: React.FC<ScriptPanelProps> = ({ project, onSeekFrame }) => {
  const videoTrack = project.tracks.find((t) => t.type === "video");
  const captionTrack = project.tracks.find((t) => t.type === "caption");

  const scenes = (videoTrack?.clips || []).map((clip, idx) => {
    const matchingCaption = captionTrack?.clips.find(
      (c) => Math.abs(c.startFrame - clip.startFrame) < 30
    );

    return {
      id: clip.id,
      index: idx + 1,
      title: clip.name,
      startFrame: clip.startFrame,
      durationSec: (clip.durationFrames / project.fps).toFixed(1),
      narration: matchingCaption?.name.replace(/^Caption:\s*/i, "") || "Dynamic B-roll sequence",
      visualIntent: clip.effects.some((e) => e.type === "lut")
        ? "Cinematic LUT graded with dynamic camera pan"
        : "Standard establishing shot"
    };
  });

  return (
    <div className="flex flex-col h-full bg-pro-darker text-xs select-none overflow-y-auto">
      {/* Header */}
      <div className="p-2.5 bg-pro-panel border-b border-pro-border flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-slate-200 font-semibold">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Scene Breakdown & Storyboard</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{scenes.length} Scenes</span>
      </div>

      {/* Scene Cards List */}
      <div className="p-2 space-y-2">
        {scenes.map((scene) => {
          const isCurrent =
            project.currentFrame >= scene.startFrame &&
            project.currentFrame < scene.startFrame + (parseFloat(scene.durationSec) * project.fps);

          return (
            <div
              key={scene.id}
              onClick={() => onSeekFrame(scene.startFrame)}
              className={`p-2.5 rounded border transition cursor-pointer flex flex-col space-y-1.5 ${
                isCurrent
                  ? "bg-blue-950/60 border-blue-500 shadow"
                  : "bg-pro-panel/60 border-pro-border hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] flex items-center space-x-1">
                  <span className="text-blue-400 font-mono">#{scene.index}</span>
                  <span>{scene.title}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{scene.durationSec}s</span>
                </span>
              </div>

              {/* Narration line */}
              <p className="text-slate-300 italic text-[11px] leading-tight">
                "{scene.narration}"
              </p>

              {/* Visual Intent tag */}
              <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Video className="w-2.5 h-2.5 text-indigo-400" />
                <span className="truncate">{scene.visualIntent}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
