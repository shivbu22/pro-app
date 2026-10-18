"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Scissors, Magnet, ZoomIn, ZoomOut, Eye, EyeOff, Lock, Trash2, MousePointer
} from "lucide-react";
import { TimelineProject, Clip, Track } from "@omnicut/shared-types";
import { formatSMPTETimecode, splitClipAtFrame, rippleDeleteClip, snapToGrid } from "@omnicut/timeline-engine";

interface ProTimelineProps {
  project: TimelineProject;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onUpdateProject: (project: TimelineProject) => void;
  onSeekFrame: (frame: number) => void;
}

export const ProTimeline: React.FC<ProTimelineProps> = ({
  project,
  selectedClipId,
  onSelectClip,
  onUpdateProject,
  onSeekFrame
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<"select" | "razor">("select");
  const [isSnapping, setIsSnapping] = useState(true);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const [clipDrag, setClipDrag] = useState<{
    clipId: string;
    mode: "move" | "trim-left" | "trim-right";
    startX: number;
    origStartFrame: number;
    origDuration: number;
  } | null>(null);

  const handleClipClick = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    if (activeTool === "razor") {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const relativeFrame = Math.round(clickX / project.zoomLevel);
      const cutFrame = clip.startFrame + relativeFrame;

      const updated = splitClipAtFrame(project, clip.id, cutFrame);
      onUpdateProject(updated);
    } else {
      onSelectClip(clip.id);
    }
  };

  const handleClipMouseDown = (
    e: React.MouseEvent,
    clip: Clip,
    mode: "move" | "trim-left" | "trim-right"
  ) => {
    if (activeTool === "razor") return;
    e.stopPropagation();
    onSelectClip(clip.id);
    setClipDrag({
      clipId: clip.id,
      mode,
      startX: e.clientX,
      origStartFrame: clip.startFrame,
      origDuration: clip.durationFrames
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead && rulerRef.current) {
        const rect = rulerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        let frame = Math.max(0, Math.round(offsetX / project.zoomLevel));
        if (isSnapping) frame = snapToGrid(frame, project.tracks, 10);
        onSeekFrame(Math.min(project.durationFrames, frame));
      }

      if (clipDrag) {
        const deltaX = e.clientX - clipDrag.startX;
        const deltaFrames = Math.round(deltaX / project.zoomLevel);

        const updatedTracks = project.tracks.map((track) => {
          const clipIdx = track.clips.findIndex((c) => c.id === clipDrag.clipId);
          if (clipIdx === -1) return track;

          const clip = track.clips[clipIdx];
          const newClips = [...track.clips];

          if (clipDrag.mode === "move") {
            let nextStart = Math.max(0, clipDrag.origStartFrame + deltaFrames);
            if (isSnapping) nextStart = snapToGrid(nextStart, project.tracks, 10);
            newClips[clipIdx] = { ...clip, startFrame: nextStart };
          } else if (clipDrag.mode === "trim-left") {
            const maxDelta = clipDrag.origDuration - 10;
            const clampedDelta = Math.min(maxDelta, deltaFrames);
            newClips[clipIdx] = {
              ...clip,
              startFrame: clipDrag.origStartFrame + clampedDelta,
              durationFrames: clipDrag.origDuration - clampedDelta
            };
          } else if (clipDrag.mode === "trim-right") {
            const nextDur = Math.max(10, clipDrag.origDuration + deltaFrames);
            newClips[clipIdx] = { ...clip, durationFrames: nextDur };
          }

          return { ...track, clips: newClips };
        });

        onUpdateProject({ ...project, tracks: updatedTracks });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
      setClipDrag(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPlayhead, clipDrag, project, isSnapping, onSeekFrame, onUpdateProject]);

  const handleRippleDelete = () => {
    if (!selectedClipId) return;
    const updated = rippleDeleteClip(project, selectedClipId);
    onUpdateProject(updated);
    onSelectClip(null);
  };

  const playheadX = project.currentFrame * project.zoomLevel;

  return (
    <div className="h-64 bg-[#08090d] border-t border-[#161922] flex flex-col select-none flex-shrink-0">
      {/* 1. Sleek Compact Toolbar */}
      <div className="h-8 bg-[#0b0d13] border-b border-[#161922] px-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-1.5">
          {/* Tool Selector */}
          <div className="flex items-center bg-[#07080c] p-0.5 rounded border border-[#171a24]">
            <button
              onClick={() => setActiveTool("select")}
              className={`px-2 py-0.5 rounded flex items-center space-x-1 text-[11px] font-medium transition ${
                activeTool === "select"
                  ? "bg-[#1c202d] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Selection Tool (V)"
            >
              <MousePointer className="w-3 h-3 text-[#3b63ff]" />
              <span>Select (V)</span>
            </button>

            <button
              onClick={() => setActiveTool("razor")}
              className={`px-2 py-0.5 rounded flex items-center space-x-1 text-[11px] font-medium transition ${
                activeTool === "razor"
                  ? "bg-rose-950/60 border border-rose-500/50 text-rose-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Razor Blade Tool (C)"
            >
              <Scissors className="w-3 h-3 text-rose-400" />
              <span>Razor (C)</span>
            </button>
          </div>

          {/* Snapping */}
          <button
            onClick={() => setIsSnapping(!isSnapping)}
            title="Toggle Snapping (S)"
            className={`px-2 py-1 rounded text-[11px] flex items-center space-x-1 border transition ${
              isSnapping
                ? "bg-[#3b63ff]/15 border-[#3b63ff]/30 text-[#9fb4ff]"
                : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Magnet className="w-3 h-3" />
            <span>Snap</span>
          </button>

          {/* Ripple Delete */}
          {selectedClipId && (
            <button
              onClick={handleRippleDelete}
              title="Ripple Delete Selected Clip"
              className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-600/40 text-rose-300 hover:bg-rose-900/50 transition flex items-center space-x-1 text-[11px]"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Ripple Delete</span>
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onUpdateProject({ ...project, zoomLevel: Math.max(0.5, project.zoomLevel - 0.25) })}
            className="p-1 text-slate-500 hover:text-slate-300 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={project.zoomLevel}
            onChange={(e) => onUpdateProject({ ...project, zoomLevel: parseFloat(e.target.value) })}
            className="w-16 accent-[#3b63ff] cursor-pointer h-1 bg-zinc-800 rounded"
          />
          <button
            onClick={() => onUpdateProject({ ...project, zoomLevel: Math.min(3, project.zoomLevel + 0.25) })}
            className="p-1 text-slate-500 hover:text-slate-300 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Main Timeline Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Track Headers (Left Column) */}
        <div className="w-40 bg-[#090b10] border-r border-[#161922] flex flex-col z-20 select-none">
          {/* Header Spacer */}
          <div className="h-6 bg-[#08090d] border-b border-[#161922] px-2.5 flex items-center text-[9px] font-mono text-slate-500">
            TRACKS
          </div>

          {/* Track Labels */}
          {project.tracks.map((track) => (
            <div
              key={track.id}
              className="border-b border-[#161922] px-2.5 flex items-center justify-between text-xs hover:bg-white/[0.02] transition"
              style={{ height: `${track.height}px` }}
            >
              <div className="flex items-center space-x-1.5">
                <span className={`text-[9px] font-bold px-1 py-0.2 rounded font-mono ${
                  track.type === "video" ? "bg-blue-900/40 text-blue-300 border border-blue-500/30" :
                  track.type === "audio" ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/30" :
                  "bg-purple-900/40 text-purple-300 border border-purple-500/30"
                }`}>
                  {track.id.toUpperCase().replace("TRACK-", "")}
                </span>
                <span className="text-slate-300 text-[10px] font-medium truncate max-w-[65px]">{track.name}</span>
              </div>

              <div className="flex items-center space-x-1 text-slate-500">
                <button
                  onClick={() => {
                    const tracks = project.tracks.map((t) => t.id === track.id ? { ...t, visible: !t.visible } : t);
                    onUpdateProject({ ...project, tracks });
                  }}
                  className={`p-1 rounded hover:text-white ${track.visible ? "text-slate-400" : "text-slate-600"}`}
                >
                  {track.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                </button>
                <button
                  onClick={() => {
                    const tracks = project.tracks.map((t) => t.id === track.id ? { ...t, locked: !t.locked } : t);
                    onUpdateProject({ ...project, tracks });
                  }}
                  className={`p-1 rounded hover:text-white ${track.locked ? "text-amber-400" : "text-slate-600"}`}
                >
                  <Lock className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tracks Content & Ruler (Scrollable) */}
        <div 
          ref={timelineBodyRef}
          onClick={() => onSelectClip(null)}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#06070a] flex flex-col select-none"
        >
          {/* Timecode Ruler */}
          <div
            ref={rulerRef}
            onMouseDown={(e) => {
              setIsDraggingPlayhead(true);
              const rect = rulerRef.current!.getBoundingClientRect();
              const offsetX = e.clientX - rect.left;
              let frame = Math.max(0, Math.round(offsetX / project.zoomLevel));
              if (isSnapping) frame = snapToGrid(frame, project.tracks, 10);
              onSeekFrame(Math.min(project.durationFrames, frame));
            }}
            className="h-6 bg-[#080a0f] border-b border-[#161922] relative cursor-ew-resize select-none shrink-0"
            style={{ width: `${project.durationFrames * project.zoomLevel + 400}px` }}
          >
            {Array.from({ length: Math.ceil(project.durationFrames / 60) + 2 }).map((_, sec) => {
              const left = sec * 60 * project.zoomLevel;
              return (
                <div key={sec} className="absolute top-0 bottom-0 border-l border-white/10 pl-1 text-[9px] font-mono text-slate-500" style={{ left: `${left}px` }}>
                  {formatSMPTETimecode(sec * 60, project.fps).slice(3, 8)}
                </div>
              );
            })}
          </div>

          {/* Tracks Area */}
          <div className="flex-1 relative" style={{ width: `${project.durationFrames * project.zoomLevel + 400}px` }}>
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="border-b border-[#14161f] relative bg-[#07080c]/60"
                style={{ height: `${track.height}px` }}
              >
                {track.clips.map((clip) => {
                  const x = clip.startFrame * project.zoomLevel;
                  const w = clip.durationFrames * project.zoomLevel;
                  const isSelected = selectedClipId === clip.id;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => handleClipClick(e, clip)}
                      onMouseDown={(e) => handleClipMouseDown(e, clip, "move")}
                      className={`group absolute top-1 bottom-1 rounded overflow-hidden cursor-pointer border flex flex-col justify-between transition-all select-none ${
                        isSelected 
                          ? "ring-1 ring-white border-white shadow-lg z-10 brightness-110" 
                          : track.type === "video"
                          ? "bg-blue-950/70 border-blue-600/40 hover:border-blue-400"
                          : track.type === "audio"
                          ? "bg-emerald-950/70 border-emerald-600/40 hover:border-emerald-400"
                          : "bg-purple-950/70 border-purple-600/40 hover:border-purple-400"
                      }`}
                      style={{ left: `${x}px`, width: `${Math.max(16, w)}px` }}
                    >
                      {/* Left Trim Handle */}
                      <div
                        onMouseDown={(e) => handleClipMouseDown(e, clip, "trim-left")}
                        title="Trim In-Point"
                        className="absolute left-0 top-0 bottom-0 w-2 hover:bg-yellow-400 cursor-ew-resize z-20 group-hover:bg-yellow-500/20 transition"
                      />

                      {/* Right Trim Handle */}
                      <div
                        onMouseDown={(e) => handleClipMouseDown(e, clip, "trim-right")}
                        title="Trim Out-Point"
                        className="absolute right-0 top-0 bottom-0 w-2 hover:bg-yellow-400 cursor-ew-resize z-20 group-hover:bg-yellow-500/20 transition"
                      />

                      {/* Clip Header Label */}
                      <div className="px-2 py-0.5 text-[9px] font-medium text-slate-100 truncate flex items-center justify-between z-10">
                        <span className="truncate">{clip.name}</span>
                        {clip.effects.length > 0 && (
                          <span className="text-[8px] bg-[#3b63ff] text-white px-1 rounded ml-1 font-mono">FX</span>
                        )}
                      </div>

                      {/* Visual Content: Media Thumbnail or Audio Waveforms */}
                      {track.type === "video" ? (
                        <div className="h-full w-full overflow-hidden opacity-50 hover:opacity-75 transition pointer-events-none relative flex items-center justify-center">
                          {clip.mediaUrl && !imgError[clip.id] ? (
                            <img
                              src={clip.mediaUrl}
                              alt=""
                              onError={() => setImgError((prev) => ({ ...prev, [clip.id]: true }))}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-950 to-indigo-950 flex items-center px-2">
                              <span className="text-[8px] text-blue-300 font-mono truncate">{clip.name}</span>
                            </div>
                          )}
                        </div>
                      ) : track.type === "audio" ? (
                        <div className="h-6 w-full flex items-center justify-around px-1 opacity-75 pointer-events-none">
                          {Array.from({ length: Math.min(36, Math.floor(w / 6)) }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-emerald-400 rounded-full"
                              style={{ height: `${((i * 13 + 5) % 18) + 4}px` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-[8px] text-purple-300 font-mono italic px-2 truncate pointer-events-none pb-0.5">
                          {clip.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Draggable Red Playhead Line */}
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none transition-all duration-75"
              style={{ left: `${playheadX}px` }}
            >
              <div className="w-3 h-3 bg-red-500 -ml-[5px] rotate-45 shadow-md cursor-ew-resize" />
              <div className="w-[1.5px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
