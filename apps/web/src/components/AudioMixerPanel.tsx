"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Sliders, Mic, Music, Disc, Zap } from "lucide-react";
import { TimelineProject, Track } from "@omnicut/shared-types";

interface AudioMixerPanelProps {
  project: TimelineProject;
  onUpdateProject: (updated: TimelineProject) => void;
}

export const AudioMixerPanel: React.FC<AudioMixerPanelProps> = ({ project, onUpdateProject }) => {
  const audioTracks = project.tracks.filter((t) => t.type === "audio");
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [duckThreshold, setDuckThreshold] = useState(-12);

  const handleTrackMute = (trackId: string) => {
    const updated = project.tracks.map((t) => t.id === trackId ? { ...t, muted: !t.muted } : t);
    onUpdateProject({ ...project, tracks: updated });
  };

  const handleTrackVolumeChange = (trackId: string, newVol: number) => {
    const updated = project.tracks.map((t) => {
      if (t.id !== trackId) return t;
      return {
        ...t,
        clips: t.clips.map((c) => ({ ...c, volume: newVol }))
      };
    });
    onUpdateProject({ ...project, tracks: updated });
  };

  return (
    <div className="w-80 h-full bg-[#0c0d12] border-l border-[#202533] flex flex-col text-xs select-none overflow-hidden">
      {/* Header */}
      <div className="h-9 bg-[#11141c] border-b border-[#202533] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white text-[11px] font-display uppercase tracking-wider">Multi-Track Audio Mixer</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
          48kHz Master
        </span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-4">
        {/* Track Channel Strips */}
        <div className="grid grid-cols-2 gap-2">
          {audioTracks.map((track, idx) => {
            const isVoice = track.id.includes("a1") || track.name.toLowerCase().includes("voice");
            const avgVol = track.clips[0]?.volume ?? 1.0;
            const dB = Math.round(20 * Math.log10(Math.max(0.01, avgVol)));

            return (
              <div key={track.id} className="bg-[#141722] border border-[#23293a] rounded-lg p-2.5 flex flex-col space-y-2.5 shadow">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] flex items-center space-x-1">
                    {isVoice ? <Mic className="w-3 h-3 text-cyan-400" /> : <Music className="w-3 h-3 text-emerald-400" />}
                    <span>{track.name}</span>
                  </span>
                  <button
                    onClick={() => handleTrackMute(track.id)}
                    className={`btn-pro px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      track.muted ? "bg-red-600 text-white" : "bg-[#202636] text-slate-300 hover:text-white"
                    }`}
                  >
                    {track.muted ? "MUTED" : "M"}
                  </button>
                </div>

                {/* Vertical Fader Slider */}
                <div className="flex flex-col items-center space-y-1 py-1">
                  <div className="h-28 w-6 bg-zinc-900 rounded-md relative flex items-center justify-center p-1 border border-zinc-800">
                    <input
                      type="range"
                      {...({ orient: "vertical" } as any)}
                      min="0"
                      max="1.5"
                      step="0.05"
                      value={track.muted ? 0 : avgVol}
                      onChange={(e) => handleTrackVolumeChange(track.id, parseFloat(e.target.value))}
                      className="h-24 w-4 accent-emerald-500 cursor-pointer"
                      style={{ writingMode: "vertical-lr", direction: "rtl" }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-300">{track.muted ? "-inf dB" : `${dB > 0 ? `+${dB}` : dB} dB`}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Master Bus & Auto-Ducking Settings */}
        <div className="bg-[#141722] border border-[#23293a] rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Voice Auto-Ducking</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">ACTIVE</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Music Ducking Depth</span>
              <span className="font-mono text-slate-200">{duckThreshold} dB</span>
            </div>
            <input
              type="range"
              min="-24"
              max="-6"
              step="1"
              value={duckThreshold}
              onChange={(e) => setDuckThreshold(parseInt(e.target.value))}
              className="w-full accent-yellow-500 cursor-pointer h-1 bg-zinc-800 rounded"
            />
            <p className="text-[9px] text-slate-500">Automatically lowers background music when voiceover narration speaks.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
