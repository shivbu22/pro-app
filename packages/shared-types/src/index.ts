export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5" | "21:9";

export interface Timecode {
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;
  fps: number;
  totalFrames: number;
}

export type TrackType = "video" | "audio" | "caption" | "adjustment";

export interface Keyframe<T = number> {
  id: string;
  frame: number;
  value: T;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "bezier";
}

export interface ShaderEffect {
  id: string;
  type: "lut" | "film-grain" | "vignette" | "chroma-key" | "blur" | "color-adjust";
  name: string;
  enabled: boolean;
  intensity: number;
  parameters: Record<string, number | string | boolean>;
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  type: "video" | "audio" | "image" | "text" | "motion-graphic";
  templateType?: "stat-counter" | "bar-chart" | "comparison" | "quote-card" | "tier-list";
  captionStyle?: "hormozi-yellow" | "tiktok-bounce" | "cinematic-fade" | "minimal-clean";
  templateData?: Record<string, any>;
  mediaUrl: string;
  thumbnailUrl?: string;
  startFrame: number;
  durationFrames: number;
  sourceStartFrame: number;
  sourceEndFrame: number;
  volume: number; // 0.0 - 2.0 (1.0 = 0dB)
  muted: boolean;
  opacity: number; // 0.0 - 1.0
  scale: number; // 1.0 = 100%
  position: { x: number; y: number };
  rotation: number;
  speed: number; // 1.0 = 100%
  effects: ShaderEffect[];
  keyframes: {
    opacity?: Keyframe<number>[];
    scale?: Keyframe<number>[];
    positionX?: Keyframe<number>[];
    positionY?: Keyframe<number>[];
    volume?: Keyframe<number>[];
  };
  promptOrigin?: {
    prompt: string;
    model: string;
    seed?: number;
    provider: string;
  };
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  muted: boolean;
  locked: boolean;
  visible: boolean;
  height: number;
  clips: Clip[];
}

export interface TimelineProject {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  durationFrames: number;
  currentFrame: number;
  zoomLevel: number; // pixels per frame
  snapEnabled: boolean;
  rippleEditEnabled: boolean;
  autoDuckEnabled?: boolean;
  tracks: Track[];
  version: number;
  updatedAt: string;
}

export interface WordTimestamp {
  word: string;
  startFrame: number;
  endFrame: number;
  confidence: number;
}

export interface CaptionSegment {
  id: string;
  startFrame: number;
  endFrame: number;
  text: string;
  words: WordTimestamp[];
  style: "hormozi-yellow" | "tiktok-bounce" | "cinematic-fade" | "minimal-clean";
}

export interface SceneShot {
  sceneIndex: number;
  shotDescription: string;
  visualPrompt: string;
  durationSec: number;
  cameraMovement: "static" | "pan-left" | "pan-right" | "drone-flyover" | "slow-zoom-in" | "dolly-out";
  generatedMediaUrl?: string;
  status: "pending" | "generating" | "ready" | "failed";
}

export interface OnePromptScript {
  id: string;
  title: string;
  conceptPrompt: string;
  aspectRatio: AspectRatio;
  targetDurationSec: number;
  theme: string;
  narrationVoice: string;
  narrationText: string;
  musicMood: string;
  shots: SceneShot[];
}

export type EditActionType =
  | "RAZOR_SPLIT"
  | "RIPPLE_DELETE"
  | "MOVE_CLIP"
  | "RETIME_CLIP"
  | "CHANGE_VOLUME"
  | "APPLY_SHADER"
  | "INSERT_B_ROLL"
  | "AUTO_SUBTITLES"
  | "AUTO_DUCK_AUDIO";

export interface EditCommand {
  id: string;
  action: EditActionType;
  trackId?: string;
  clipId?: string;
  atFrame?: number;
  parameters: Record<string, any>;
  description: string;
}

export interface EditProposal {
  id: string;
  userPrompt: string;
  summary: string;
  commands: EditCommand[];
  status: "pending_review" | "applied" | "rejected";
  timestamp: string;
}
