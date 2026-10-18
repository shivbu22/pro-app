"use client";

import React, { useState } from "react";
import { Palette, Sparkles, Sun, Contrast, Droplet, Eye, Sliders, RefreshCw, Check } from "lucide-react";
import { TimelineProject, Clip, ShaderEffect } from "@omnicut/shared-types";

interface LumetriColorPanelProps {
  project: TimelineProject;
  selectedClipId: string | null;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
}

export const LumetriColorPanel: React.FC<LumetriColorPanelProps> = ({
  project,
  selectedClipId,
  onUpdateClip
}) => {
  // Find selected or active clip
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

  // Color values
  const [exposure, setExposure] = useState(0); // -100 to 100
  const [contrast, setContrast] = useState(1.15); // 0.5 to 2.0
  const [temp, setTemp] = useState(0); // -50 to 50
  const [saturation, setSaturation] = useState(1.2); // 0 to 2
  const [vignette, setVignette] = useState(20); // 0 to 100

  const lutPresets = [
    { id: "teal-orange", name: "Teal & Orange Blockbuster", desc: "Hollywood blockbuster aesthetic" },
    { id: "cyberpunk", name: "Cyberpunk Neon 2077", desc: "Vibrant high-contrast blues & purples" },
    { id: "film-35mm", name: "Vintage 35mm Film Stock", desc: "Warm Kodak Portra organic tones" },
    { id: "noir", name: "Monochrome Film Noir", desc: "Deep rich contrast black & white" },
    { id: "golden-hour", name: "Golden Sunset Warmth", desc: "Lush ambient golden highlights" }
  ];

  const handleApplyLut = (lut: typeof lutPresets[0]) => {
    if (!clip) return;
    const newEffect: ShaderEffect = {
      id: `lut-${Date.now()}`,
      type: "lut",
      name: lut.name,
      enabled: true,
      intensity: 1.0,
      parameters: { preset: lut.id }
    };
    onUpdateClip(clip.id, {
      effects: [newEffect]
    });
  };

  const handleReset = () => {
    if (!clip) return;
    setExposure(0);
    setContrast(1.0);
    setTemp(0);
    setSaturation(1.0);
    setVignette(0);
    onUpdateClip(clip.id, { effects: [] });
  };

  return (
    <div className="w-80 h-full bg-[#0c0d12] border-l border-[#202533] flex flex-col text-xs select-none overflow-hidden">
      {/* Header */}
      <div className="h-9 bg-[#11141c] border-b border-[#202533] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white text-[11px] font-display uppercase tracking-wider">Lumetri Color Suite</span>
        </div>
        <button
          onClick={handleReset}
          title="Reset to Neutral"
          className="btn-pro text-[10px] text-slate-400 hover:text-white flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {clip ? (
          <>
            <div className="bg-[#141722] p-2 rounded border border-[#23293a] flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Target Clip:</span>
              <span className="text-[11px] font-bold text-white font-mono truncate max-w-[140px]">{clip.name}</span>
            </div>

            {/* Basic Corrections */}
            <div className="space-y-3">
              <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-3 h-3 text-blue-400" />
                <span>Basic Correction</span>
              </span>

              {/* Exposure Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Sun className="w-3 h-3 text-amber-400" />
                    <span>Exposure</span>
                  </span>
                  <span className="font-mono text-slate-200">{(exposure / 50).toFixed(2)} EV</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={exposure}
                  onChange={(e) => setExposure(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1 bg-zinc-800 rounded"
                />
              </div>

              {/* Contrast Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Contrast className="w-3 h-3 text-indigo-400" />
                    <span>Contrast</span>
                  </span>
                  <span className="font-mono text-slate-200">{contrast.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={contrast}
                  onChange={(e) => setContrast(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1 bg-zinc-800 rounded"
                />
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Temperature</span>
                  <span className="font-mono text-slate-200">{temp > 0 ? `+${temp}K` : `${temp}K`}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={temp}
                  onChange={(e) => setTemp(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1 bg-zinc-800 rounded"
                />
              </div>

              {/* Saturation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Droplet className="w-3 h-3 text-cyan-400" />
                    <span>Saturation</span>
                  </span>
                  <span className="font-mono text-slate-200">{Math.round(saturation * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={saturation}
                  onChange={(e) => setSaturation(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1 bg-zinc-800 rounded"
                />
              </div>
            </div>

            {/* Creative 3D LUT Presets */}
            <div className="space-y-2 pt-2 border-t border-[#1e2330]">
              <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>3D LUT Cinema Looks</span>
              </span>

              <div className="space-y-1.5">
                {lutPresets.map((lut) => {
                  const isApplied = clip?.effects.some((e) => e.name === lut.name);
                  return (
                    <div
                      key={lut.id}
                      onClick={() => handleApplyLut(lut)}
                      className={`btn-pro p-2 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                        isApplied
                          ? "bg-purple-950/40 border-purple-500 shadow"
                          : "bg-[#141722] border-[#222736] hover:border-slate-500"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-white text-[11px]">{lut.name}</p>
                        <p className="text-[10px] text-slate-400">{lut.desc}</p>
                      </div>
                      {isApplied && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-500 py-12">
            <p>Select a video clip on the timeline to grade its colors.</p>
          </div>
        )}
      </div>
    </div>
  );
};
