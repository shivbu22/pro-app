"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Maximize, Grid, Volume2, Film, Sparkles
} from "lucide-react";
import { TimelineProject, Clip } from "@omnicut/shared-types";
import { formatSMPTETimecode } from "@omnicut/timeline-engine";
import { MotionGraphicsRenderer } from "./MotionGraphicsRenderer";

interface ProgramMonitorProps {
  project: TimelineProject;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeekFrame: (frame: number) => void;
}

export const ProgramMonitor: React.FC<ProgramMonitorProps> = ({
  project,
  isPlaying,
  onTogglePlay,
  onSeekFrame
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSafeMargins, setShowSafeMargins] = useState(false);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [vuLevels, setVuLevels] = useState<{ left: number; right: number }>({ left: -45, right: -48 });

  // Find active video, overlay, caption and audio clips at the current frame
  const activeVideoTrack = project.tracks.find((t) => t.type === "video" && t.visible);
  const activeCaptionTrack = project.tracks.find((t) => t.type === "caption" && t.visible);
  const activeAudioTrack = project.tracks.find((t) => t.type === "audio" && t.visible);

  const activeVideoClip = activeVideoTrack?.clips.find(
    (c) => project.currentFrame >= c.startFrame && project.currentFrame < c.startFrame + c.durationFrames
  );

  const activeCaptionClip = activeCaptionTrack?.clips.find(
    (c) => project.currentFrame >= c.startFrame && project.currentFrame < c.startFrame + c.durationFrames
  );

  const activeAudioClip = activeAudioTrack?.clips.find(
    (c) => project.currentFrame >= c.startFrame && project.currentFrame < c.startFrame + c.durationFrames
  );

  const isVoiceoverActive = Boolean(activeCaptionClip || (activeAudioClip && activeAudioTrack?.id.includes("a1")));
  const activeLut = activeVideoClip?.effects.find((e) => e.type === "lut" && e.enabled);

  // Dynamic Stereo VU Meter simulation
  useEffect(() => {
    if (!isPlaying) {
      setVuLevels({ left: -55, right: -55 });
      return;
    }
    const interval = setInterval(() => {
      const base = activeAudioClip ? (isVoiceoverActive ? -8 : -18) : -28;
      const jitterL = (Math.random() * 8) - 4;
      const jitterR = (Math.random() * 8) - 4;
      setVuLevels({
        left: Math.max(-60, Math.min(0, base + jitterL)),
        right: Math.max(-60, Math.min(0, base + jitterR))
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isPlaying, activeAudioClip, isVoiceoverActive]);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const isVertical = project.aspectRatio === "9:16";
  const isSquare = project.aspectRatio === "1:1";

  return (
    <div className="flex-1 flex flex-col bg-[#06070a] border-b border-[#161922] select-none relative overflow-hidden">
      {/* Monitor Header Sub-bar */}
      <div className="h-7 bg-[#0b0d13] border-b border-[#161922] flex items-center justify-between px-3 text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-300 tracking-wide text-[10px] uppercase font-mono">
            {activeVideoClip ? activeVideoClip.name : "Program"}
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-[10px] text-slate-400">
            {project.width}x{project.height} · {project.fps}fps
          </span>
          {activeLut && (
            <span className="text-[9px] bg-[#3b63ff]/15 text-[#9fb4ff] border border-[#3b63ff]/30 px-1.5 py-0.2 rounded font-mono">
              LUT: {activeLut.name}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => setShowSafeMargins(!showSafeMargins)}
            title="Composition Grid & Safe Margins"
            className={`p-1 rounded transition ${showSafeMargins ? "bg-[#3b63ff]/20 text-[#3b63ff]" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Grid className="w-3 h-3" />
          </button>
          <button 
            onClick={handleToggleFullscreen}
            title="Fullscreen Monitor"
            className="text-slate-500 hover:text-slate-300 p-1 rounded transition"
          >
            <Maximize className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Screening Room Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[#050608] flex items-center justify-center p-3 relative overflow-hidden"
      >
        <div 
          className="relative bg-[#0a0c12] border border-[#1a1d28] rounded shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-200"
          style={{
            aspectRatio: isVertical ? "9/16" : isSquare ? "1/1" : "16/9",
            maxHeight: "94%",
            maxWidth: "94%"
          }}
        >
          {activeVideoClip ? (
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-zinc-950">
              {activeVideoClip.type === "motion-graphic" ? (
                <MotionGraphicsRenderer clip={activeVideoClip} currentFrame={project.currentFrame} />
              ) : activeVideoClip.mediaUrl && !imgError[activeVideoClip.id] ? (
                <img
                  src={activeVideoClip.mediaUrl}
                  alt={activeVideoClip.name}
                  onError={() => setImgError((prev) => ({ ...prev, [activeVideoClip.id]: true }))}
                  className="w-full h-full object-cover transition-transform duration-100"
                  style={{
                    transform: `scale(${activeVideoClip.scale}) translate(${activeVideoClip.position.x}px, ${activeVideoClip.position.y}px)`,
                    filter: activeLut
                      ? "contrast(1.15) saturate(1.25) brightness(0.95) hue-rotate(-10deg)"
                      : "none"
                  }}
                />
              ) : (
                /* Sleek Cinematic Gradient Fallback Card */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1424] via-[#090c17] to-[#05070c] p-6 text-center text-slate-200 relative">
                  <div className="w-12 h-12 rounded-full bg-[#3b63ff]/15 border border-[#3b63ff]/30 flex items-center justify-center mb-3">
                    <Film className="w-6 h-6 text-[#9fb4ff]" />
                  </div>
                  <h4 className="text-sm font-bold tracking-tight text-white mb-1">{activeVideoClip.name}</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm line-clamp-2">
                    {activeVideoClip.promptOrigin?.prompt || "Cinematic 8K sequence with volumetric lighting"}
                  </p>
                  <span className="absolute bottom-3 right-3 text-[9px] font-mono bg-black/60 px-2 py-0.5 rounded text-slate-400 border border-white/10">
                    ProRes 422 HQ · 60fps
                  </span>
                </div>
              )}

              {/* Composition Grid Overlay */}
              {showSafeMargins && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-20">
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-r border-white/10" />
                  <div />
                </div>
              )}

              {/* Dynamic Kinetic Subtitles Overlay */}
              {activeCaptionClip && (
                <div className="absolute bottom-8 inset-x-0 flex justify-center px-4 pointer-events-none z-30">
                  <div className="bg-black/80 backdrop-blur px-4 py-1.5 rounded-lg border border-yellow-400/40 shadow-xl">
                    <span className="text-yellow-300 font-extrabold tracking-wide text-lg uppercase drop-shadow font-sans">
                      {activeCaptionClip.name.replace(/^Caption:\s*/i, "")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-600 font-mono text-xs p-6">
              <Film className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
              <p className="text-slate-400 font-medium">No Media at Playhead</p>
              <p className="text-[10px] text-slate-600 mt-1">Press Spacebar to play or import clips</p>
            </div>
          )}
        </div>

        {/* Minimalist Integrated VU Peak Meter */}
        <div className="absolute right-3 bottom-12 w-3.5 bg-black/80 border border-white/10 rounded-sm p-0.5 flex flex-col justify-end items-center select-none h-24 backdrop-blur">
          <div className="w-1.5 flex-1 bg-zinc-900 rounded-xs relative overflow-hidden flex flex-col justify-end">
            <div 
              className="w-full bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
              style={{ height: `${Math.max(4, Math.min(100, ((vuLevels.left + 60) / 60) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating Minimalist Transport Control Bar */}
      <div className="h-9 px-4 bg-[#0a0c12] border-t border-[#161922] flex items-center justify-between text-xs font-mono text-slate-400 select-none">
        {/* Current SMPTE Timecode */}
        <div className="flex items-center space-x-2">
          <span className="text-[#3b63ff] font-bold text-xs">
            {formatSMPTETimecode(project.currentFrame, project.fps)}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-500 text-[11px]">
            {formatSMPTETimecode(project.durationFrames, project.fps)}
          </span>
        </div>

        {/* Playhead Shuttle Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSeekFrame(0)}
            className="text-slate-400 hover:text-white transition p-1"
            title="Return to Start (Home)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-6 h-6 rounded-full bg-[#3b63ff] hover:bg-[#4a70ff] text-white flex items-center justify-center shadow-md shadow-[#3b63ff]/25 transition transform active:scale-95"
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 fill-white" />
            ) : (
              <Play className="w-3 h-3 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={() => onSeekFrame(project.durationFrames)}
            className="text-slate-400 hover:text-white transition p-1"
            title="Jump to End (End)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Frame Position */}
        <div className="text-[11px] text-slate-500">
          Frame {project.currentFrame}
        </div>
      </div>
    </div>
  );
};
