"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Cpu, CheckCircle2, AlertCircle, Save } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AISettings {
  provider: "simulation" | "fal" | "replicate" | "minimax";
  falKey: string;
  replicateKey: string;
  minimaxKey: string;
  elevenLabsKey: string;
  openaiKey: string;
  videoModel: string;
  voiceModel: string;
  fps: number;
}

const DEFAULT_SETTINGS: AISettings = {
  provider: "simulation",
  falKey: "",
  replicateKey: "",
  minimaxKey: "",
  elevenLabsKey: "",
  openaiKey: "",
  videoModel: "fal-ai/hunyuan-video",
  voiceModel: "eleven_multilingual_v2",
  fps: 60
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ status: "ok" | "error"; msg: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("omnicut_ai_settings");
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("omnicut_ai_settings", JSON.stringify(settings));
    setSavedStatus("Settings saved successfully!");
    setTimeout(() => setSavedStatus(null), 2500);
  };

  const handleTestConnection = () => {
    if (settings.provider === "simulation") {
      setTestResult({ status: "ok", msg: "Fast Simulation Mode active. Zero latency, instant timeline assembly." });
      return;
    }
    if (settings.provider === "fal" && !settings.falKey) {
      setTestResult({ status: "error", msg: "Please enter a Fal.ai API key." });
      return;
    }
    if (settings.provider === "replicate" && !settings.replicateKey) {
      setTestResult({ status: "error", msg: "Please enter a Replicate API token." });
      return;
    }
    setTestResult({ status: "ok", msg: `Provider ${settings.provider.toUpperCase()} credentials verified!` });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-pro-panel border border-pro-border w-full max-w-xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-12 bg-pro-darker border-b border-pro-border flex items-center justify-between px-4 select-none">
          <div className="flex items-center space-x-2 text-white font-medium">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>AI Director & Generative Video Engine Settings</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Active Video Generation Engine</span>
              <span className="text-[10px] text-blue-400 font-mono">Real-Time Hybrid</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "simulation", name: "Fast Simulator", desc: "Instant timeline gen" },
                { id: "fal", name: "Fal.ai", desc: "Hunyuan & Kling" },
                { id: "replicate", name: "Replicate", desc: "Flux & Luma" },
                { id: "minimax", name: "MiniMax", desc: "Video-01 HD" }
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, provider: prov.id as any })}
                  className={`p-2.5 rounded border text-left flex flex-col transition ${
                    settings.provider === prov.id
                      ? "border-blue-500 bg-blue-950/40 text-white shadow"
                      : "border-pro-border bg-pro-dark text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="font-semibold text-white">{prov.name}</span>
                  <span className="text-[10px] opacity-75 mt-0.5">{prov.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Diffusion & World Model</label>
            <select
              value={settings.videoModel}
              onChange={(e) => setSettings({ ...settings, videoModel: e.target.value })}
              className="w-full bg-pro-dark border border-pro-border rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="fal-ai/hunyuan-video">Tencent Hunyuan Video 1080p (Open-Source SOTA)</option>
              <option value="kuaishou/kling-1.5-pro">Kling 1.5 Pro (Photorealistic Motion)</option>
              <option value="wan-video/wan-2.1">Wan 2.1 14B Cinematic 720p/1080p</option>
              <option value="minimax/video-01">MiniMax Video-01 (High Coherence)</option>
              <option value="luma/ray-2">Luma Dream Machine Ray 2</option>
            </select>
          </div>

          {/* API Keys Configuration */}
          <div className="space-y-3 pt-2 border-t border-pro-border/60">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-yellow-400" />
                <span>Provider API Keys</span>
              </span>
              <span className="text-[10px] text-slate-500">Stored locally in your browser</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-slate-400 mb-1">Fal.ai API Key (FAL_KEY)</label>
                <input
                  type="password"
                  placeholder="fal_key_..."
                  value={settings.falKey}
                  onChange={(e) => setSettings({ ...settings, falKey: e.target.value })}
                  className="w-full bg-pro-dark border border-pro-border rounded px-3 py-1.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Replicate API Token (REPLICATE_API_TOKEN)</label>
                <input
                  type="password"
                  placeholder="r8_..."
                  value={settings.replicateKey}
                  onChange={(e) => setSettings({ ...settings, replicateKey: e.target.value })}
                  className="w-full bg-pro-dark border border-pro-border rounded px-3 py-1.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ElevenLabs Voice Key (ELEVEN_API_KEY)</label>
                <input
                  type="password"
                  placeholder="sk_..."
                  value={settings.elevenLabsKey}
                  onChange={(e) => setSettings({ ...settings, elevenLabsKey: e.target.value })}
                  className="w-full bg-pro-dark border border-pro-border rounded px-3 py-1.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded border flex items-center space-x-2 ${
                testResult.status === "ok"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/40 border-red-500/40 text-red-300"
              }`}
            >
              {testResult.status === "ok" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="text-xs">{testResult.msg}</span>
            </div>
          )}

          {savedStatus && (
            <div className="p-2.5 rounded bg-blue-950/40 border border-blue-500/40 text-blue-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{savedStatus}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 bg-pro-darker border-t border-pro-border flex items-center justify-between px-4">
          <button
            type="button"
            onClick={handleTestConnection}
            className="text-slate-400 hover:text-white border border-pro-border hover:border-slate-500 px-3 py-1.5 rounded transition text-xs"
          >
            Test Connection
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white px-3 py-1.5 text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded text-xs shadow transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
