"use client";

import React, { useState } from "react";
import { Scissors, Trash2, Wand2, Volume2, Sparkles, FastForward } from "lucide-react";
import { TimelineProject } from "@omnicut/shared-types";
import { rippleDeleteRange } from "@omnicut/timeline-engine";

export interface TranscriptWord {
  id: string;
  word: string;
  startFrame: number;
  endFrame: number;
  isFiller?: boolean;
}

interface TranscriptEditorProps {
  project: TimelineProject;
  onUpdateProject: (updated: TimelineProject) => void;
  onSeekFrame: (frame: number) => void;
}

// Generate transcript words mapped to active speech & captions
function generateWordsFromProject(project: TimelineProject): TranscriptWord[] {
  const words: TranscriptWord[] = [];
  const captionTrack = project.tracks.find((t) => t.type === "caption");
  if (!captionTrack) return words;

  captionTrack.clips.forEach((clip, clipIndex) => {
    const text = clip.name.replace(/^Caption:\s*/i, "");
    const rawWords = text.split(/\s+/).filter(Boolean);
    const wordDur = Math.max(8, Math.floor(clip.durationFrames / Math.max(1, rawWords.length)));

    rawWords.forEach((w, wIndex) => {
      const s = clip.startFrame + (wIndex * wordDur);
      const e = Math.min(clip.startFrame + clip.durationFrames, s + wordDur);
      words.push({
        id: `w-${clipIndex}-${wIndex}`,
        word: w,
        startFrame: s,
        endFrame: e,
        isFiller: ["um", "uh", "like", "so"].includes(w.toLowerCase().replace(/[^a-z]/g, ""))
      });
    });
  });

  return words;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  project,
  onUpdateProject,
  onSeekFrame
}) => {
  const words = generateWordsFromProject(project);
  const [selectedWord, setSelectedWord] = useState<TranscriptWord | null>(null);

  // Active word based on playhead
  const currentFrame = project.currentFrame;

  // Ripple delete selected word
  const handleDeleteWord = (word: TranscriptWord) => {
    const updated = rippleDeleteRange(project, word.startFrame, word.endFrame);
    onUpdateProject(updated);
    setSelectedWord(null);
  };

  // Auto-remove silences and filler words
  const handleRemoveFillers = () => {
    let currentProject = project;
    // Remove filler words from back to front to avoid shifting indices
    const fillers = [...words.filter((w) => w.isFiller)].reverse();
    for (const f of fillers) {
      currentProject = rippleDeleteRange(currentProject, f.startFrame, f.endFrame);
    }
    onUpdateProject(currentProject);
  };

  return (
    <div className="flex flex-col h-full bg-pro-darker text-xs select-none">
      {/* Toolbar */}
      <div className="p-2.5 bg-pro-panel border-b border-pro-border flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-slate-200 font-semibold">
          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Speech Transcript</span>
        </div>
        <button
          onClick={handleRemoveFillers}
          title="Detect and ripple-delete filler words ('um', 'uh', pauses)"
          className="flex items-center space-x-1 bg-indigo-950/70 border border-indigo-700/60 hover:bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded text-[10px] transition"
        >
          <Wand2 className="w-3 h-3 text-indigo-400" />
          <span>Auto-Trim Fillers</span>
        </button>
      </div>

      {/* Transcript Text Flow */}
      <div className="flex-1 p-3 overflow-y-auto leading-relaxed text-slate-300">
        {words.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <p>No narration track or captions detected.</p>
            <p className="text-[10px] mt-1 text-slate-600">Use 1-Prompt Video to generate spoken scenes.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {words.map((w) => {
              const isActive = currentFrame >= w.startFrame && currentFrame < w.endFrame;
              const isSelected = selectedWord?.id === w.id;

              return (
                <span
                  key={w.id}
                  onClick={() => {
                    onSeekFrame(w.startFrame);
                    setSelectedWord(w);
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition font-sans text-xs ${
                    isActive
                      ? "bg-yellow-400 text-black font-bold shadow-md scale-105"
                      : isSelected
                      ? "bg-blue-600 text-white font-medium"
                      : w.isFiller
                      ? "text-slate-500 line-through decoration-red-500 hover:bg-red-950/40"
                      : "hover:bg-pro-panel hover:text-white text-slate-200"
                  }`}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Footer when a word is selected */}
      {selectedWord && (
        <div className="p-2 bg-pro-panel border-t border-pro-border flex items-center justify-between text-[11px] animate-fade-in">
          <div className="truncate max-w-[140px] text-slate-300">
            Selected: <span className="font-bold text-white">"{selectedWord.word}"</span>
          </div>
          <button
            onClick={() => handleDeleteWord(selectedWord)}
            className="flex items-center space-x-1 bg-red-900/80 hover:bg-red-800 text-white px-2 py-1 rounded text-xs transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>Cut from Timeline</span>
          </button>
        </div>
      )}
    </div>
  );
};
