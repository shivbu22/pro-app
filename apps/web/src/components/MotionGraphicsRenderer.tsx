"use client";

import React from "react";
import { TrendingUp, Award, BarChart3, Quote, CheckCircle, XCircle } from "lucide-react";
import { Clip } from "@omnicut/shared-types";

interface MotionGraphicsRendererProps {
  clip: Clip;
  currentFrame: number;
}

export const MotionGraphicsRenderer: React.FC<MotionGraphicsRendererProps> = ({
  clip,
  currentFrame
}) => {
  const relativeFrame = Math.max(0, currentFrame - clip.startFrame);
  const progress = Math.min(1, relativeFrame / Math.max(1, clip.durationFrames));

  const templateType = clip.templateType || "stat-counter";

  if (templateType === "stat-counter") {
    const endVal = clip.templateData?.targetValue || 1000000;
    const currentVal = Math.floor(endVal * Math.min(1, progress * 1.2));
    const prefix = clip.templateData?.prefix || "$";
    const suffix = clip.templateData?.suffix || "+";
    const label = clip.templateData?.label || "ARR GROWTH MILESTONE";

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/90 via-slate-950/90 to-black/90 p-6 text-center select-none animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(59,130,246,0.6)]">
          <TrendingUp className="w-6 h-6 text-blue-400 animate-pulse" />
        </div>
        <div className="text-xs uppercase tracking-widest text-blue-300 font-mono mb-1 font-semibold">
          {label}
        </div>
        <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-indigo-300 tracking-tight font-mono drop-shadow-lg">
          {prefix}{currentVal.toLocaleString()}{suffix}
        </div>
        <div className="mt-3 w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-75"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
      </div>
    );
  }

  if (templateType === "bar-chart") {
    const bars = clip.templateData?.bars || [
      { name: "Traditional NLE", val: 24, color: "from-zinc-600 to-zinc-500" },
      { name: "Manual Cut", val: 45, color: "from-amber-600 to-amber-500" },
      { name: "OmniCut AI", val: 98, color: "from-blue-500 to-indigo-500" }
    ];

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 p-8 select-none">
        <div className="text-center mb-6">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Performance Comparison</span>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">Workflow Efficiency (Index)</h3>
        </div>
        <div className="w-full max-w-sm space-y-3">
          {bars.map((bar: any, idx: number) => {
            const barProg = Math.min(1, Math.max(0, (progress - (idx * 0.15)) * 2));
            const currentW = bar.val * barProg;

            return (
              <div key={bar.name} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>{bar.name}</span>
                  <span className="font-mono">{Math.round(currentW)}%</span>
                </div>
                <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-75`}
                    style={{ width: `${currentW}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (templateType === "comparison") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950/95 p-6 select-none">
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {/* Old Way */}
          <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/30 flex flex-col space-y-2">
            <div className="flex items-center space-x-1.5 text-red-400 font-bold text-xs uppercase">
              <XCircle className="w-4 h-4" />
              <span>Old Manual Way</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1">
              <li>• Hours of manual razor cuts</li>
              <li>• Missing filler word tracking</li>
              <li>• Complex keyframing</li>
            </ul>
          </div>

          {/* OmniCut AI */}
          <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-500/50 flex flex-col space-y-2 shadow-xl">
            <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-xs uppercase">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>OmniCut Pro</span>
            </div>
            <ul className="text-[11px] text-slate-200 space-y-1">
              <li>• 1-Prompt whole video gen</li>
              <li>• Auto-trim silences & fillers</li>
              <li>• Conversational director diffs</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Fallback Quote Card
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-8 text-center select-none">
      <Quote className="w-8 h-8 text-indigo-400/60 mb-2" />
      <p className="text-lg font-serif italic text-slate-100 max-w-md drop-shadow">
        "{clip.templateData?.quote || "The future of cinema belongs to those who direct intelligence, not just frames."}"
      </p>
      <div className="mt-3 text-xs font-bold text-indigo-300 font-mono tracking-wider">
        — {clip.templateData?.author || "OmniCut Studio Visionary"}
      </div>
    </div>
  );
};
