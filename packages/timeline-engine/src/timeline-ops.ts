import { TimelineProject, Clip, Track } from "@omnicut/shared-types";

export function recalculateProjectDuration(project: TimelineProject): TimelineProject {
  let maxFrame = 0;
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      const end = clip.startFrame + clip.durationFrames;
      if (end > maxFrame) maxFrame = end;
    }
  }
  return {
    ...project,
    durationFrames: Math.max(project.fps * 5, maxFrame),
    version: project.version + 1,
    updatedAt: new Date().toISOString()
  };
}

export function splitClipAtFrame(
  project: TimelineProject,
  clipId: string,
  splitFrame: number
): TimelineProject {
  let modified = false;
  const newTracks = project.tracks.map((track) => {
    const clipIndex = track.clips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return track;

    const clip = track.clips[clipIndex];
    if (splitFrame <= clip.startFrame || splitFrame >= clip.startFrame + clip.durationFrames) {
      return track;
    }

    const firstDuration = splitFrame - clip.startFrame;
    const secondDuration = clip.durationFrames - firstDuration;

    const clipA: Clip = {
      ...clip,
      id: `${clip.id}-a`,
      name: `${clip.name} (Part 1)`,
      durationFrames: firstDuration,
      sourceEndFrame: clip.sourceStartFrame + firstDuration
    };

    const clipB: Clip = {
      ...clip,
      id: `${clip.id}-b`,
      name: `${clip.name} (Part 2)`,
      startFrame: splitFrame,
      durationFrames: secondDuration,
      sourceStartFrame: clip.sourceStartFrame + firstDuration
    };

    modified = true;
    const updatedClips = [...track.clips];
    updatedClips.splice(clipIndex, 1, clipA, clipB);
    return { ...track, clips: updatedClips };
  });

  if (!modified) return project;
  return recalculateProjectDuration({ ...project, tracks: newTracks });
}

export function rippleDeleteClip(
  project: TimelineProject,
  clipId: string,
  rippleAllTracks: boolean = false
): TimelineProject {
  let targetStart = -1;
  let targetDuration = 0;
  let targetTrackId = "";

  for (const track of project.tracks) {
    const found = track.clips.find((c) => c.id === clipId);
    if (found) {
      targetStart = found.startFrame;
      targetDuration = found.durationFrames;
      targetTrackId = track.id;
      break;
    }
  }

  if (targetStart === -1) return project;

  const newTracks = project.tracks.map((track) => {
    const shouldShift = rippleAllTracks || track.id === targetTrackId;
    const filteredClips = track.clips
      .filter((c) => c.id !== clipId)
      .map((c) => {
        if (shouldShift && c.startFrame >= targetStart + targetDuration) {
          return { ...c, startFrame: c.startFrame - targetDuration };
        }
        return c;
      });

    return { ...track, clips: filteredClips };
  });

  return recalculateProjectDuration({ ...project, tracks: newTracks });
}

export function snapToGrid(
  targetFrame: number,
  tracks: Track[],
  snapThresholdFrames: number = 5
): number {
  let closest = targetFrame;
  let minDiff = snapThresholdFrames + 1;

  for (const track of tracks) {
    for (const clip of track.clips) {
      const startDiff = Math.abs(clip.startFrame - targetFrame);
      if (startDiff < minDiff) {
        minDiff = startDiff;
        closest = clip.startFrame;
      }
      const endDiff = Math.abs((clip.startFrame + clip.durationFrames) - targetFrame);
      if (endDiff < minDiff) {
        minDiff = endDiff;
        closest = clip.startFrame + clip.durationFrames;
      }
    }
  }

  return closest;
}


export function rippleDeleteRange(
  project: TimelineProject,
  startFrame: number,
  endFrame: number,
  trackIds?: string[]
): TimelineProject {
  if (startFrame >= endFrame) return project;
  const cutDuration = endFrame - startFrame;

  const newTracks = project.tracks.map((track) => {
    if (trackIds && !trackIds.includes(track.id)) {
      return track;
    }

    const newClips: Clip[] = [];

    for (const clip of track.clips) {
      const clipStart = clip.startFrame;
      const clipEnd = clip.startFrame + clip.durationFrames;

      // Case 1: Clip is completely before the cut
      if (clipEnd <= startFrame) {
        newClips.push(clip);
      }
      // Case 2: Clip is completely after the cut -> shift left
      else if (clipStart >= endFrame) {
        newClips.push({
          ...clip,
          startFrame: clip.startFrame - cutDuration
        });
      }
      // Case 3: Cut is completely inside the clip -> split into left and right pieces
      else if (clipStart < startFrame && clipEnd > endFrame) {
        const leftDuration = startFrame - clipStart;
        const clipLeft: Clip = {
          ...clip,
          id: `${clip.id}-l`,
          durationFrames: leftDuration,
          sourceEndFrame: clip.sourceStartFrame + leftDuration
        };

        const rightDuration = clipEnd - endFrame;
        const clipRight: Clip = {
          ...clip,
          id: `${clip.id}-r`,
          startFrame: startFrame,
          durationFrames: rightDuration,
          sourceStartFrame: clip.sourceStartFrame + (endFrame - clipStart),
          sourceEndFrame: clip.sourceEndFrame
        };

        newClips.push(clipLeft, clipRight);
      }
      // Case 4: Clip starts before cut and ends inside cut -> trim tail
      else if (clipStart < startFrame && clipEnd <= endFrame) {
        const newDuration = startFrame - clipStart;
        if (newDuration > 0) {
          newClips.push({
            ...clip,
            durationFrames: newDuration,
            sourceEndFrame: clip.sourceStartFrame + newDuration
          });
        }
      }
      // Case 5: Clip starts inside cut and ends after cut -> trim head and shift
      else if (clipStart >= startFrame && clipEnd > endFrame) {
        const trimHead = endFrame - clipStart;
        const newDuration = clip.durationFrames - trimHead;
        if (newDuration > 0) {
          newClips.push({
            ...clip,
            startFrame: startFrame,
            durationFrames: newDuration,
            sourceStartFrame: clip.sourceStartFrame + trimHead
          });
        }
      }
      // Case 6: Clip is completely inside the cut -> omitted
    }

    return { ...track, clips: newClips };
  });

  return recalculateProjectDuration({ ...project, tracks: newTracks });
}
