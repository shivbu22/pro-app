"use client";

import React, { useState } from "react";
import { Folder, Film, Music, Type, Sparkles, Plus, BarChart3, TrendingUp, CheckSquare, Quote } from "lucide-react";
import { TimelineProject, Clip } from "@omnicut/shared-types";

interface ProjectBinProps {
  project: TimelineProject;
  onInsertClipToTimeline: (clip: Clip) => void;
}

export const ProjectBin: React.FC<ProjectBinProps> = ({ project, onInsertClipToTimeline }) => {
  const [activeTab, setActiveTab] = useState<"media" | "audio" | "templates">("media");
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const allClips = project.tracks.flatMap((t) => t.clips);
  const videoClips = allClips.filter((c) => c.type === "video" || c.type === "image");
  const audioClips = allClips.filter((c) => c.type === "audio");

  const templatePresets = [
    {
      id: "stat-counter-1",
      name: "Stat Counter ($1M ARR)",
      templateType: "stat-counter" as const,
      icon: TrendingUp,
      desc: "Animated count-up with progress bar",
      data: { targetValue: 1000000, prefix: "$", suffix: "+", label: "ARR GROWTH MILESTONE" }
    },
    {
      id: "bar-chart-1",
      name: "Efficiency Bar Chart",
      templateType: "bar-chart" as const,
      icon: BarChart3,
      desc: "Rising comparative bar graphics",
      data: {
        bars: [
          { name: "Traditional NLE", val: 24, color: "from-zinc-600 to-zinc-500" },
          { name: "Manual Cut", val: 45, color: "from-amber-600 to-amber-500" },
          { name: "OmniCut AI", val: 98, color: "from-blue-500 to-indigo-500" }
        ]
      }
    },
    {
      id: "comparison-1",
      name: "Before vs After Card",
      templateType: "comparison" as const,
      icon: CheckSquare,
      desc: "Side-by-side feature comparison",
      data: {}
    },
    {
      id: "quote-1",
      name: "Director Quote Card",
      templateType: "quote-card" as const,
      icon: Quote,
      desc: "Glowing cinematic quote card",
      data: {
        quote: "The future belongs to those who direct intelligence, not just frames.",
        author: "OmniCut Studio Visionary"
      }
    }
  ];

  const handleInsertTemplate = (preset: typeof templatePresets[0]) => {
    const newClip: Clip = {
      id: `mg-${Date.now()}`,
      trackId: "v1",
      name: preset.name,
      type: "motion-graphic",
      templateType: preset.templateType,
      templateData: preset.data,
      mediaUrl: "",
      startFrame: project.currentFrame,
      durationFrames: 180,
      sourceStartFrame: 0,
      sourceEndFrame: 180,
      volume: 1.0,
      muted: false,
      opacity: 1.0,
      scale: 1.0,
      position: { x: 0, y: 0 },
      rotation: 0,
      speed: 1.0,
      effects: [],
      keyframes: {}
    };

    onInsertClipToTimeline(newClip);
  };

  return (
    <div className="w-full h-full bg-[#0b0d13] flex flex-col text-xs select-none">
      {/* Sub Tabs */}
      <div className="flex border-b border-[#161922] bg-[#08090d] text-[11px]">
        {[
          { id: "media", label: "Footage" },
          { id: "audio", label: "Audio" },
          { id: "templates", label: "Motion FX" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1.5 text-center font-medium transition ${
              activeTab === tab.id
                ? "bg-[#11141c] text-white border-b-2 border-[#3b63ff]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {/* Media Tab */}
        {activeTab === "media" && (
          <div className="grid grid-cols-2 gap-2">
            {videoClips.map((clip) => (
              <div
                key={clip.id}
                onClick={() => onInsertClipToTimeline(clip)}
                className="group relative bg-[#0e1017] border border-[#1a1d28] hover:border-[#3b63ff]/60 rounded overflow-hidden cursor-pointer transition shadow-sm"
              >
                <div className="aspect-video bg-[#08090d] overflow-hidden relative flex items-center justify-center">
                  {clip.mediaUrl && !imgError[clip.id] ? (
                    <img
                      src={clip.mediaUrl}
                      alt={clip.name}
                      onError={() => setImgError((prev) => ({ ...prev, [clip.id]: true }))}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121524] to-[#080a11] p-2 text-center">
                      <Film className="w-4 h-4 text-blue-400 mb-1" />
                      <span className="text-[9px] text-slate-300 font-medium truncate max-w-[80px]">
                        {clip.name}
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 text-[9px] font-mono rounded text-slate-300">
                    {(clip.durationFrames / project.fps).toFixed(1)}s
                  </span>
                </div>
                <div className="p-1.5">
                  <p className="text-[10px] font-medium text-slate-200 truncate">{clip.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Audio Tab */}
        {activeTab === "audio" && (
          <div className="space-y-1.5">
            {audioClips.map((clip) => (
              <div
                key={clip.id}
                onClick={() => onInsertClipToTimeline(clip)}
                className="p-2 bg-[#0e1017] border border-[#1a1d28] hover:border-emerald-500/50 rounded flex items-center justify-between cursor-pointer transition"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-emerald-950/60 border border-emerald-600/30 flex items-center justify-center">
                    <Music className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-200 truncate max-w-[150px]">{clip.name}</p>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {(clip.durationFrames / project.fps).toFixed(1)}s · 48kHz
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Insert</span>
              </div>
            ))}
          </div>
        )}

        {/* Motion FX Tab */}
        {activeTab === "templates" && (
          <div className="space-y-1.5">
            {templatePresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleInsertTemplate(preset)}
                  className="p-2 bg-[#0e1017] border border-[#1a1d28] hover:border-indigo-500/50 rounded flex items-center justify-between cursor-pointer transition group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-indigo-950/60 border border-indigo-600/30 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-200">{preset.name}</p>
                      <p className="text-[9px] text-slate-500">{preset.desc}</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-[#9fb4ff] font-mono group-hover:underline">+ Add</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
