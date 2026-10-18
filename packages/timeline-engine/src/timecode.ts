import { Timecode } from "@omnicut/shared-types";

export function framesToTimecode(totalFrames: number, fps: number = 30): Timecode {
  const safeFps = Math.max(1, fps);
  const totalSeconds = Math.floor(totalFrames / safeFps);
  const frames = Math.floor(totalFrames % safeFps);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, frames, fps: safeFps, totalFrames };
}

export function formatSMPTETimecode(frames: number, fps: number = 30): string {
  const tc = framesToTimecode(frames, fps);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(tc.hours)}:${pad(tc.minutes)}:${pad(tc.seconds)}:${pad(tc.frames)}`;
}

export function timecodeToFrames(hours: number, minutes: number, seconds: number, frames: number, fps: number = 30): number {
  return Math.round((hours * 3600 + minutes * 60 + seconds) * fps + frames);
}

export function secondsToFrames(seconds: number, fps: number = 30): number {
  return Math.round(seconds * fps);
}

export function framesToSeconds(frames: number, fps: number = 30): number {
  return frames / fps;
}
