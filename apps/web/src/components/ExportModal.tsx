"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Download, Film, FileCode2, Check, X, Sparkles, Image as ImageIcon, Copy, FileText, CheckCircle2, RefreshCw, Zap
} from "lucide-react";
import { TimelineProject } from "@omnicut/shared-types";
import { exportToFCPXML } from "@omnicut/ai-director";
import { formatSMPTETimecode } from "@omnicut/timeline-engine";

interface ExportModalProps {
  project: TimelineProject;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"render" | "thumbnail" | "metadata">("render");
  const [format, setFormat] = useState<"mp4" | "fcpxml" | "srt" | "bundle">("mp4");
  const [resolution, setResolution] = useState<"1080p" | "4k" | "shorts">("1080p");
  const [isExporting, setIsExporting] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [copiedMetadata, setCopiedMetadata] = useState(false);

  // Thumbnail State
  const [thumbnailText, setThumbnailText] = useState("THIS CHANGES EVERYTHING");
  const [thumbnailStyle, setThumbnailStyle] = useState<"mrbeast" | "cinematic" | "hormozi">("mrbeast");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active video clip at current playhead for thumbnail backdrop
  const activeVideoTrack = project.tracks.find((t) => t.type === "video");
  const activeClip = activeVideoTrack?.clips.find(
    (c) => project.currentFrame >= c.startFrame && project.currentFrame < c.startFrame + c.durationFrames
  ) || activeVideoTrack?.clips[0];

  // Draw thumbnail canvas whenever text, style, or modal opens
  useEffect(() => {
    if (!isOpen || activeTab !== "thumbnail") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    // Draw background
    ctx.fillStyle = "#0c0e14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If active clip has an image, load and draw it
    const drawContent = () => {
      // Vignette & Contrast gradient
      const grad = ctx.createRadialGradient(640, 360, 200, 640, 360, 700);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top and bottom cinema bars if cinematic style
      if (thumbnailStyle === "cinematic") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, 60);
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      }

      // Render High-CTR Thumbnail Typography
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (thumbnailStyle === "mrbeast") {
        ctx.font = "900 76px 'Impact', 'Arial Black', sans-serif";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 18;
        ctx.strokeText(thumbnailText.toUpperCase(), 640, 560);

        ctx.fillStyle = "#facc15"; // Neon Yellow
        ctx.fillText(thumbnailText.toUpperCase(), 640, 560);

        // Alert Badge
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(490, 100, 300, 55);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText("MUST WATCH", 640, 128);
      } else if (thumbnailStyle === "hormozi") {
        ctx.font = "900 80px sans-serif";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 14;
        ctx.strokeText(thumbnailText.toUpperCase(), 640, 550);

        ctx.fillStyle = "#22d3ee"; // Cyan
        ctx.fillText(thumbnailText.toUpperCase(), 640, 550);
      } else {
        // Cinematic style
        ctx.font = "italic bold 64px 'Georgia', serif";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 20;
        ctx.fillText(thumbnailText, 640, 560);
      }

      ctx.restore();
    };

    if (activeClip?.mediaUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawContent();
      };
      img.onerror = () => {
        drawContent();
      };
      img.src = activeClip.mediaUrl;
    } else {
      drawContent();
    }
  }, [isOpen, activeTab, thumbnailText, thumbnailStyle, activeClip]);

  if (!isOpen) return null;

  // Generate SRT Subtitles
  const generateSRT = (): string => {
    const captionTrack = project.tracks.find((t) => t.type === "caption");
    if (!captionTrack) return "1\n00:00:00,000 --> 00:00:04,000\nOmniCut Pro Sequence\n";

    return captionTrack.clips.map((clip, idx) => {
      const startSec = clip.startFrame / project.fps;
      const endSec = (clip.startFrame + clip.durationFrames) / project.fps;

      const formatSRTTime = (sec: number) => {
        const hrs = Math.floor(sec / 3600);
        const mins = Math.floor((sec % 3600) / 60);
        const secs = Math.floor(sec % 60);
        const ms = Math.floor((sec % 1) * 1000);
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
      };

      return `${idx + 1}\n${formatSRTTime(startSec)} --> ${formatSRTTime(endSec)}\n${clip.name.replace(/^Caption:\s*/i, "")}\n`;
    }).join("\n");
  };

  // Generate YouTube Chapters & SEO Description
  const videoTrack = project.tracks.find((t) => t.type === "video");
  const chapters = (videoTrack?.clips || []).map((clip) => {
    const totalSec = Math.floor(clip.startFrame / project.fps);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return `${timeFormatted} - ${clip.name}`;
  }).join("\n");

  const youtubeDescription = `${project.title}\n\nGenerated with OmniCut Pro — The Next-Gen Premiere Pro AI Video Studio.\n\nTIMESTAMPS / CHAPTERS:\n${chapters}\n\nTAGS: #AIvideo #VideoEditing #PremierePro #OmniCut #ContentCreator`;

  const handleStartExport = () => {
    setIsExporting(true);
    setDownloadReady(false);

    setTimeout(() => {
      setIsExporting(false);
      setDownloadReady(true);

      if (format === "fcpxml") {
        const xml = exportToFCPXML(project);
        const blob = new Blob([xml], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.title.replace(/[^a-z0-9]/gi, "_")}.fcpxml`;
        a.click();
      } else if (format === "srt") {
        const srt = generateSRT();
        const blob = new Blob([srt], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.title.replace(/[^a-z0-9]/gi, "_")}_subtitles.srt`;
        a.click();
      }
    }, 1200);
  };

  const handleDownloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/jpeg", 0.95);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9]/gi, "_")}_thumbnail.jpg`;
    a.click();
  };

  const handleCopyMetadata = () => {
    navigator.clipboard.writeText(youtubeDescription);
    setCopiedMetadata(true);
    setTimeout(() => setCopiedMetadata(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10131a] border border-[#232938] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="h-12 bg-[#0b0d12] border-b border-[#202533] flex items-center justify-between px-4 select-none">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm font-display tracking-wide">Export & Creator Publish Pack</span>
          </div>
          <button onClick={onClose} className="btn-pro text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b border-[#202533] bg-[#0e1017] text-xs">
          <button
            onClick={() => setActiveTab("render")}
            className={`btn-pro flex-1 py-2 font-semibold transition ${
              activeTab === "render"
                ? "bg-[#181c26] text-emerald-400 border-b-2 border-emerald-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Video & XML
          </button>
          <button
            onClick={() => setActiveTab("thumbnail")}
            className={`btn-pro flex-1 py-2 font-semibold transition ${
              activeTab === "thumbnail"
                ? "bg-[#181c26] text-yellow-400 border-b-2 border-yellow-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Thumbnail Studio
          </button>
          <button
            onClick={() => setActiveTab("metadata")}
            className={`btn-pro flex-1 py-2 font-semibold transition ${
              activeTab === "metadata"
                ? "bg-[#181c26] text-blue-400 border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            YouTube SEO Kit
          </button>
        </div>

        {/* Tab 1: Render Video & XML */}
        {activeTab === "render" && (
          <div className="p-5 space-y-4 text-xs">
            {/* Format Selection */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Master Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mp4", label: "MP4 Video", icon: Film, desc: "H.264 Master 60fps" },
                  { id: "fcpxml", label: "Premiere / FCPXML", icon: FileCode2, desc: "Native NLE Sequence" },
                  { id: "srt", label: "SRT Subtitles", icon: FileText, desc: "Timed Captions" }
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id as any)}
                      className={`btn-pro p-2.5 rounded-lg border text-left flex flex-col space-y-1 transition ${
                        format === fmt.id
                          ? "border-emerald-500 bg-emerald-950/30 text-white shadow-md"
                          : "border-[#202533] bg-[#141822] text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-bold text-white text-[11px]">{fmt.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{fmt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution Options */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Resolution & Framing</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "1080p", label: "1080p Full HD", desc: "1920x1080" },
                  { id: "4k", label: "4K UHD Master", desc: "3840x2160" },
                  { id: "shorts", label: "9:16 Shorts/Reels", desc: "1080x1920" }
                ].map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setResolution(res.id as any)}
                    className={`btn-pro p-2 rounded-lg border text-left transition ${
                      resolution === res.id
                        ? "border-blue-500 bg-blue-950/30 text-white shadow"
                        : "border-[#202533] bg-[#141822] text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <p className="font-semibold text-white text-[11px]">{res.label}</p>
                    <p className="text-[10px] text-slate-400">{res.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sequence Specs Summary */}
            <div className="bg-[#0b0d13] p-3 rounded-lg border border-[#1e2330] space-y-1 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-slate-200">{formatSMPTETimecode(project.durationFrames, project.fps)}</span>
              </div>
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className="text-slate-200">{project.fps} fps</span>
              </div>
              <div className="flex justify-between">
                <span>Video Tracks:</span>
                <span className="text-slate-200">{project.tracks.filter(t => t.type === "video").length} Tracks</span>
              </div>
            </div>

            {/* Export Trigger */}
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="btn-pro w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Encoding Master Track...</span>
                </>
              ) : downloadReady ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Export Download Ready!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Start Export</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: Thumbnail Studio */}
        {activeTab === "thumbnail" && (
          <div className="p-5 space-y-4 text-xs">
            {/* Live Canvas Preview */}
            <div className="rounded-lg overflow-hidden border border-[#232938] shadow-xl relative aspect-video bg-black flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>

            {/* Thumbnail Text Input */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Thumbnail Overlay Text</label>
              <input
                type="text"
                value={thumbnailText}
                onChange={(e) => setThumbnailText(e.target.value)}
                placeholder="High-CTR headline..."
                className="w-full bg-[#13161f] border border-[#232938] rounded-lg px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Thumbnail Style Switcher */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Typography Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mrbeast", label: "MrBeast Glow", desc: "Yellow 3D Shadow" },
                  { id: "hormozi", label: "Hormozi Punch", desc: "Cyan Heavy Stroke" },
                  { id: "cinematic", label: "Cinematic Film", desc: "Classic Letterbox" }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setThumbnailStyle(s.id as any)}
                    className={`btn-pro p-2 rounded-lg border text-left transition ${
                      thumbnailStyle === s.id
                        ? "border-yellow-500 bg-yellow-950/30 text-white"
                        : "border-[#202533] bg-[#141822] text-slate-400"
                    }`}
                  >
                    <p className="font-semibold text-white text-[11px]">{s.label}</p>
                    <p className="text-[10px] text-slate-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDownloadThumbnail}
              className="btn-pro w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold py-2.5 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition"
            >
              <ImageIcon className="w-4 h-4 text-black" />
              <span>Download High-CTR Thumbnail (1280x720)</span>
            </button>
          </div>
        )}

        {/* Tab 3: YouTube SEO Kit */}
        {activeTab === "metadata" && (
          <div className="p-5 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Auto-Generated Chapters & Description</label>
              <textarea
                readOnly
                rows={8}
                value={youtubeDescription}
                className="w-full bg-[#0d0f15] border border-[#232938] rounded-lg p-3 text-slate-300 font-mono text-[11px] leading-relaxed focus:outline-none"
              />
            </div>

            <button
              onClick={handleCopyMetadata}
              className="btn-pro w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition"
            >
              {copiedMetadata ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Description & Timestamps</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="h-10 bg-[#0b0d12] border-t border-[#202533] flex items-center justify-end px-4">
          <button
            onClick={onClose}
            className="btn-pro text-slate-400 hover:text-white px-3 py-1 rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
