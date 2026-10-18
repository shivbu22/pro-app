"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TimelineProject, Clip, AspectRatio } from "@omnicut/shared-types";
import { generateScriptFromPrompt, assembleTimelineFromScript } from "@omnicut/ai-director";
import { TopMenuBar, WorkspaceMode } from "../components/TopMenuBar";
import { ProgramMonitor } from "../components/ProgramMonitor";
import { LeftDock } from "../components/LeftDock";
import { Inspector } from "../components/Inspector";
import { LumetriColorPanel } from "../components/LumetriColorPanel";
import { AudioMixerPanel } from "../components/AudioMixerPanel";
import { ProTimeline } from "../components/ProTimeline";
import { AIDirectorBar } from "../components/AIDirectorBar";
import { OnePromptModal } from "../components/OnePromptModal";
import { ExportModal } from "../components/ExportModal";
import { SettingsModal } from "../components/SettingsModal";

export default function StudioPage() {
  const [project, setProject] = useState<TimelineProject>(() => {
    const defaultScript = generateScriptFromPrompt(
      "Cinematic Cyberpunk Electric Hypercar Product Launch with Night Neon Shots",
      30,
      "16:9"
    );
    return assembleTimelineFromScript(defaultScript, 30);
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>("vclip-1");
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceMode>("edit");
  const [isOnePromptOpen, setIsOnePromptOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Panel Collapsibility States (Zen Desktop NLE)
  const [showLeftDock, setShowLeftDock] = useState(true);
  const [showInspector, setShowInspector] = useState(false);

  const [history, setHistory] = useState<TimelineProject[]>([]);
  const [redoStack, setRedoStack] = useState<TimelineProject[]>([]);

  const updateProjectWithHistory = useCallback((newProject: TimelineProject) => {
    setHistory((prev) => [...prev.slice(-30), project]);
    setRedoStack([]);
    setProject(newProject);
  }, [project]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [...prev, project]);
    setHistory((prev) => prev.slice(0, -1));
    setProject(previous);
  }, [history, project]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, project]);
    setRedoStack((prev) => prev.slice(0, -1));
    setProject(next);
  }, [redoStack, project]);

  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      if (deltaSec >= 1 / project.fps) {
        lastTimeRef.current = now;
        setProject((prev) => {
          if (prev.currentFrame >= prev.durationFrames) {
            setIsPlaying(false);
            return { ...prev, currentFrame: 0 };
          }
          return { ...prev, currentFrame: prev.currentFrame + 1 };
        });
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, project.fps, project.durationFrames]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === "KeyK") {
        setIsPlaying(false);
      } else if (e.code === "KeyL") {
        setIsPlaying(true);
      } else if (e.code === "KeyJ") {
        setProject((prev) => ({ ...prev, currentFrame: Math.max(0, prev.currentFrame - 30) }));
      } else if (e.code === "Home") {
        setProject((prev) => ({ ...prev, currentFrame: 0 }));
      } else if (e.code === "End") {
        setProject((prev) => ({ ...prev, currentFrame: prev.durationFrames }));
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleUpdateClip = (clipId: string, updates: Partial<Clip>) => {
    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c))
    }));
    updateProjectWithHistory({ ...project, tracks: updatedTracks });
  };

  const isRightDockOpen = activeWorkspace === "color" || activeWorkspace === "audio" || showInspector;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07080b] text-slate-200 overflow-hidden font-sans">
      {/* 1. Sleek Desktop Menu Bar */}
      <TopMenuBar
        projectTitle={project.title}
        aspectRatio={project.aspectRatio}
        onAspectRatioChange={(ratio: AspectRatio) => {
          updateProjectWithHistory({
            ...project,
            aspectRatio: ratio,
            width: ratio === "9:16" ? 1080 : ratio === "1:1" ? 1080 : 1920,
            height: ratio === "9:16" ? 1920 : ratio === "1:1" ? 1080 : 1080
          });
        }}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={setActiveWorkspace}
        onOpenOnePromptModal={() => setIsOnePromptOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        showInspector={showInspector}
        onToggleInspector={() => setShowInspector(!showInspector)}
        showLeftDock={showLeftDock}
        onToggleLeftDock={() => setShowLeftDock(!showLeftDock)}
      />

      {/* 2. Middle Workspace (Media Bin | Program Monitor | Optional Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Media Bin Dock */}
        {showLeftDock && (
          <div className="w-72 border-r border-[#161922] flex flex-col flex-shrink-0 transition-all duration-150">
            <LeftDock
              project={project}
              onUpdateProject={updateProjectWithHistory}
              onSeekFrame={(frame) => setProject({ ...project, currentFrame: frame })}
              onClose={() => setShowLeftDock(false)}
            />
          </div>
        )}

        {/* Center: Majestic Program Monitor Viewport */}
        <div className="flex-1 flex overflow-hidden">
          <ProgramMonitor
            project={project}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onSeekFrame={(frame) => setProject({ ...project, currentFrame: frame })}
          />
        </div>

        {/* Right Dock: Color / Audio or Collapsible Inspector */}
        {isRightDockOpen && (
          <div className="w-72 border-l border-[#161922] flex flex-col flex-shrink-0 transition-all duration-150">
            {activeWorkspace === "color" ? (
              <LumetriColorPanel
                project={project}
                selectedClipId={selectedClipId}
                onUpdateClip={handleUpdateClip}
              />
            ) : activeWorkspace === "audio" ? (
              <AudioMixerPanel
                project={project}
                onUpdateProject={updateProjectWithHistory}
              />
            ) : (
              <Inspector
                project={project}
                selectedClipId={selectedClipId}
                onUpdateClip={handleUpdateClip}
                onClose={() => setShowInspector(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* 3. Pro NLE Timeline */}
      <ProTimeline
        project={project}
        selectedClipId={selectedClipId}
        onSelectClip={(id) => {
          setSelectedClipId(id);
          if (id && !showInspector) setShowInspector(true);
        }}
        onUpdateProject={updateProjectWithHistory}
        onSeekFrame={(frame) => setProject({ ...project, currentFrame: frame })}
      />

      {/* 4. Sleek AI Director Bar */}
      <AIDirectorBar
        project={project}
        onUpdateProject={(updated: TimelineProject) => {
          updateProjectWithHistory(updated);
        }}
      />

      {/* Modals */}
      <OnePromptModal
        isOpen={isOnePromptOpen}
        onClose={() => setIsOnePromptOpen(false)}
        onTimelineGenerated={(newProject: TimelineProject) => {
          updateProjectWithHistory(newProject);
          setIsOnePromptOpen(false);
          setSelectedClipId(newProject.tracks[0]?.clips[0]?.id || null);
        }}
      />

      <ExportModal
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
