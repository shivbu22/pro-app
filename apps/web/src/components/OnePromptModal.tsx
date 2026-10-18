"use client";

import React, { useState } from "react";
import { Sparkles, X, Wand2, Film, Layers, Check } from "lucide-react";
import { AspectRatio, OnePromptScript } from "@omnicut/shared-types";
import { generateScriptFromPrompt, assembleTimelineFromScript } from "@omnicut/ai-director";
import { TimelineProject } from "@omnicut/shared-types";

interface OnePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimelineGenerated: (project: TimelineProject) => void;
}

export const OnePromptModal: React.FC<OnePromptModalProps> = ({
  isOpen,
  onClose,
  onTimelineGenerated
}) => {
  const [prompt, setPrompt] = useState(
    "A 30-second high-energy teaser trailer for a luxury cyberpunk electric hypercar with cinematic night city shots, deep bass drops, and dynamic subtitles."
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [durationSec, setDurationSec] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<string>("");

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setStep("Drafting script & cinematic shot list...");

    setTimeout(() => {
      setStep("Dispatching video generation jobs (Kling & FLUX)...");
      setTimeout(() => {
        setStep("Generating authoritative voiceover & beat-synced score...");
        setTimeout(() => {
          setStep("Auto-assembling multi-track timeline & animated captions...");
          setTimeout(() => {
            const script = generateScriptFromPrompt(prompt, durationSec, aspectRatio);
            const project = assembleTimelineFromScript(script, 30);
            onTimelineGenerated(project);
            setIsGenerating(false);
            onClose();
          }, 600);
        }, 600);
      }, 700);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-pro-darker border border-pro-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-11 bg-pro-dark border-b border-pro-border px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-white text-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>1-Prompt Video Factory</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Describe your video concept in detail</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. A product launch video for a smart ring with clean minimalist shots, crisp female voiceover, and modern kinetic captions..."
              className="w-full bg-pro-darker border border-pro-border rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition leading-relaxed text-xs"
            />
          </div>

          {/* Aspect Ratio & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 block font-medium">Aspect Ratio</label>
              <div className="flex space-x-1 font-mono">
                {(["16:9", "9:16", "1:1"] as AspectRatio[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`flex-1 py-1.5 rounded border text-center transition ${
                      aspectRatio === r
                        ? "bg-blue-600 border-blue-500 text-white font-semibold"
                        : "bg-pro-panel border-pro-border text-slate-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-medium">Duration: {durationSec}s</label>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={durationSec}
                onChange={(e) => setDurationSec(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-zinc-800 rounded-lg mt-2"
              />
            </div>
          </div>

          {/* Progress / Step indicator */}
          {isGenerating && (
            <div className="bg-indigo-950/60 border border-indigo-800 p-3 rounded-lg flex items-center space-x-3 text-indigo-200">
              <Wand2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <span className="text-xs font-medium animate-pulse">{step}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 bg-pro-dark border-t border-pro-border px-4 flex items-center justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded text-slate-400 hover:text-white transition">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-4 py-1.5 rounded shadow transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Generate Entire Sequence</span>
          </button>
        </div>
      </div>
    </div>
  );
};
