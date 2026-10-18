"use client";

import React from "react";
import { Sliders, Move, X, RotateCw, Volume2, Sparkles } from "lucide-react";
import { TimelineProject, Clip } from "@omnicut/shared-types";

interface InspectorProps {
  project: TimelineProject;
  selectedClipId: string | null;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onClose?: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  project,
  selectedClipId,
  onUpdateClip,
  onClose
}) => {
  let clip: Clip | undefined;
  for (const track of project.tracks) {
    if (selectedClipId) {
      clip = track.clips.find((c) => c.id === selectedClipId);
      if (clip) break;
    }
  }

  if (!clip) {
    const vTrack = project.tracks.find((t) => t.type === "video");
    clip = vTrack?.clips.find(
      (c) => project.currentFrame >= c.startFrame && project.currentFrame < c.startFrame + c.durationFrames
    );
  }

  return (
    <div className="w-full h-full bg-[#0b0d13] flex flex-col text-xs select-none">
      {/* Inspector Header */}
      <div className="h-8 bg-[#090b10] flex items-center justify-between px-3 border-b border-[#161922] text-slate-400">
        <div className="flex items-center space-x-1.5 font-medium text-slate-200">
          <Sliders className="w-3.5 h-3.5 text-[#3b63ff]" />
          <span className="text-[11px]">Inspector</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[90px]">
            {clip ? clip.name : "None"}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-white/5"
              title="Close Inspector"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {clip ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Transform Section */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Move className="w-3 h-3 text-[#3b63ff]" />
              <span>Transform</span>
            </h4>

            {/* Scale */}
            <div className="bg-[#0e1017] p-2.5 rounded border border-[#1a1d28] space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Scale</span>
                <span className="font-mono text-[#9fb4ff]">{Math.round(clip.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={clip.scale}
                onChange={(e) => onUpdateClip(clip!.id, { scale: parseFloat(e.target.value) })}
                className="w-full accent-[#3b63ff] cursor-pointer h-1 bg-zinc-800 rounded"
              />
            </div>

            {/* Position X / Y */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0e1017] p-2 rounded border border-[#1a1d28]">
                <span className="text-[10px] text-slate-400 block mb-1">Position X</span>
                <input
                  type="number"
                  value={clip.position.x}
                  onChange={(e) => onUpdateClip(clip!.id, { position: { ...clip!.position, x: parseInt(e.target.value) || 0 } })}
                  className="w-full bg-[#08090d] border border-[#171a24] rounded px-2 py-0.5 font-mono text-[11px] text-slate-200"
                />
              </div>
              <div className="bg-[#0e1017] p-2 rounded border border-[#1a1d28]">
                <span className="text-[10px] text-slate-400 block mb-1">Position Y</span>
                <input
                  type="number"
                  value={clip.position.y}
                  onChange={(e) => onUpdateClip(clip!.id, { position: { ...clip!.position, y: parseInt(e.target.value) || 0 } })}
                  className="w-full bg-[#08090d] border border-[#171a24] rounded px-2 py-0.5 font-mono text-[11px] text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Audio & Opacity Section */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Volume2 className="w-3 h-3 text-emerald-400" />
              <span>Audio & Compositing</span>
            </h4>

            <div className="bg-[#0e1017] p-2.5 rounded border border-[#1a1d28] space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Opacity</span>
                <span className="font-mono text-slate-200">{Math.round(clip.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={clip.opacity}
                onChange={(e) => onUpdateClip(clip!.id, { opacity: parseFloat(e.target.value) })}
                className="w-full accent-[#3b63ff] cursor-pointer h-1 bg-zinc-800 rounded"
              />
            </div>

            <div className="bg-[#0e1017] p-2.5 rounded border border-[#1a1d28] space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Volume</span>
                <span className="font-mono text-emerald-400">{Math.round(clip.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={clip.volume}
                onChange={(e) => onUpdateClip(clip!.id, { volume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 rounded"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-slate-500">
          <p className="text-[11px]">Select a clip on the timeline to inspect properties</p>
        </div>
      )}
    </div>
  );
};
