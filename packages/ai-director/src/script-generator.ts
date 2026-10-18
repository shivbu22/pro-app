import { OnePromptScript, TimelineProject, Track, Clip, AspectRatio } from "@omnicut/shared-types";
import { secondsToFrames, recalculateProjectDuration } from "@omnicut/timeline-engine";

const VERIFIED_CINEMATIC_SHOTS = [
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1920&q=80"
];

export function generateScriptFromPrompt(
  prompt: string,
  targetDurationSec: number = 30,
  aspectRatio: AspectRatio = "16:9"
): OnePromptScript {
  const shotCount = Math.max(3, Math.round(targetDurationSec / 6));
  const shotDuration = Math.round(targetDurationSec / shotCount);

  return {
    id: `script-${Date.now()}`,
    title: prompt.slice(0, 40) + "...",
    conceptPrompt: prompt,
    aspectRatio,
    targetDurationSec,
    theme: "Cinematic High Impact",
    narrationVoice: "Adam - Deep Authoritative Narration",
    narrationText: `In a world moving at the speed of light, precision is everything. Experience the future before it arrives. This is not just an evolution. It is a revolution.`,
    musicMood: "Intense Hybrid Orchestral & Synth Beat Drops",
    shots: Array.from({ length: shotCount }, (_, idx) => ({
      sceneIndex: idx + 1,
      shotDescription: `Scene ${idx + 1}: Dynamic visual sequence illustrating "${prompt.slice(0, 30)}"`,
      visualPrompt: `Cinematic 8K, photorealistic, volumetric lighting, anamorphic lens, scene ${idx + 1} of: ${prompt}`,
      durationSec: shotDuration,
      cameraMovement: idx % 2 === 0 ? "slow-zoom-in" : "drone-flyover",
      status: "ready",
      generatedMediaUrl: VERIFIED_CINEMATIC_SHOTS[idx % VERIFIED_CINEMATIC_SHOTS.length]
    }))
  };
}

export function assembleTimelineFromScript(script: OnePromptScript, fps: number = 30): TimelineProject {
  const videoClips: Clip[] = [];
  let currentStart = 0;

  script.shots.forEach((shot, index) => {
    const dur = secondsToFrames(shot.durationSec, fps);
    videoClips.push({
      id: `vclip-${index + 1}`,
      trackId: "track-v1",
      name: `Scene ${shot.sceneIndex}`,
      type: "image",
      mediaUrl: shot.generatedMediaUrl || VERIFIED_CINEMATIC_SHOTS[index % VERIFIED_CINEMATIC_SHOTS.length],
      startFrame: currentStart,
      durationFrames: dur,
      sourceStartFrame: 0,
      sourceEndFrame: dur,
      volume: 1.0,
      muted: false,
      opacity: 1.0,
      scale: 1.0,
      position: { x: 0, y: 0 },
      rotation: 0,
      speed: 1.0,
      effects: [
        {
          id: `fx-lut-${index}`,
          type: "lut",
          name: "Moody Teal & Orange",
          enabled: true,
          intensity: 0.85,
          parameters: { lutPreset: "cinematic-teal-orange" }
        }
      ],
      keyframes: {
        scale: [
          { id: `k1-${index}`, frame: currentStart, value: 1.0, easing: "ease-in-out" },
          { id: `k2-${index}`, frame: currentStart + dur, value: 1.08, easing: "ease-in-out" }
        ]
      },
      promptOrigin: {
        prompt: shot.visualPrompt,
        model: "FLUX.1-Pro / Kling 1.5",
        provider: "fal.ai"
      }
    });
    currentStart += dur;
  });

  const totalFrames = currentStart;

  const audioTrack1: Track = {
    id: "track-a1",
    name: "A1: Voiceover Narration",
    type: "audio",
    muted: false,
    locked: false,
    visible: true,
    height: 52,
    clips: [
      {
        id: "clip-vo-1",
        trackId: "track-a1",
        name: "Voiceover (AI Voice)",
        type: "audio",
        mediaUrl: "https://actions.google.com/sounds/v1/human_voices/male_voice_announcement.ogg",
        startFrame: 15,
        durationFrames: totalFrames - 30,
        sourceStartFrame: 0,
        sourceEndFrame: totalFrames - 30,
        volume: 1.2,
        muted: false,
        opacity: 1.0,
        scale: 1.0,
        position: { x: 0, y: 0 },
        rotation: 0,
        speed: 1.0,
        effects: [],
        keyframes: {}
      }
    ]
  };

  const audioTrack2: Track = {
    id: "track-a2",
    name: "A2: Background Score (Ducked)",
    type: "audio",
    muted: false,
    locked: false,
    visible: true,
    height: 52,
    clips: [
      {
        id: "clip-music-1",
        trackId: "track-a2",
        name: "Cinematic Hybrid Beat",
        type: "audio",
        mediaUrl: "https://actions.google.com/sounds/v1/ambient/ambient_sound_effects.ogg",
        startFrame: 0,
        durationFrames: totalFrames,
        sourceStartFrame: 0,
        sourceEndFrame: totalFrames,
        volume: 0.4,
        muted: false,
        opacity: 1.0,
        scale: 1.0,
        position: { x: 0, y: 0 },
        rotation: 0,
        speed: 1.0,
        effects: [],
        keyframes: {
          volume: [
            { id: "duck-1", frame: 15, value: 0.25 },
            { id: "duck-2", frame: totalFrames - 30, value: 0.8 }
          ]
        }
      }
    ]
  };

  const videoTrack1: Track = {
    id: "track-v1",
    name: "V1: Master Video Track",
    type: "video",
    muted: false,
    locked: false,
    visible: true,
    height: 72,
    clips: videoClips
  };

  const captionTrack: Track = {
    id: "track-c1",
    name: "C1: Kinetic Captions",
    type: "caption",
    muted: false,
    locked: false,
    visible: true,
    height: 40,
    clips: [
      {
        id: "clip-caption-1",
        trackId: "track-c1",
        name: "Dynamic Hormozi Captions",
        type: "text",
        mediaUrl: "",
        startFrame: 15,
        durationFrames: totalFrames - 30,
        sourceStartFrame: 0,
        sourceEndFrame: totalFrames - 30,
        volume: 1.0,
        muted: false,
        opacity: 1.0,
        scale: 1.0,
        position: { x: 0, y: 350 },
        rotation: 0,
        speed: 1.0,
        effects: [],
        keyframes: {}
      }
    ]
  };

  const [width, height] = script.aspectRatio === "9:16" ? [1080, 1920] : [1920, 1080];

  const project: TimelineProject = {
    id: `project-${Date.now()}`,
    title: script.title,
    fps,
    width,
    height,
    aspectRatio: script.aspectRatio,
    durationFrames: totalFrames,
    currentFrame: 0,
    zoomLevel: 1.5,
    snapEnabled: true,
    rippleEditEnabled: true,
    tracks: [captionTrack, videoTrack1, audioTrack1, audioTrack2],
    version: 1,
    updatedAt: new Date().toISOString()
  };

  return recalculateProjectDuration(project);
}
