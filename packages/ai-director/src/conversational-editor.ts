import { TimelineProject, EditProposal, EditCommand } from "@omnicut/shared-types";
import { splitClipAtFrame, rippleDeleteClip } from "@omnicut/timeline-engine";

export function parseNaturalLanguageEdit(
  prompt: string,
  project: TimelineProject
): EditProposal {
  const p = prompt.toLowerCase();
  const commands: EditCommand[] = [];
  let summary = "";

  if (p.includes("cut") || p.includes("pause") || p.includes("split")) {
    const timeMatch = p.match(/(\d+):(\d+)/);
    let targetFrame = project.currentFrame;
    if (timeMatch) {
      const min = parseInt(timeMatch[1], 10);
      const sec = parseInt(timeMatch[2], 10);
      targetFrame = (min * 60 + sec) * project.fps;
    }

    commands.push({
      id: `cmd-${Date.now()}-1`,
      action: "RAZOR_SPLIT",
      atFrame: targetFrame,
      parameters: { frame: targetFrame },
      description: `Blade cut clips across active tracks at frame ${targetFrame}`
    });
    summary = `Split clips at timecode ${Math.floor(targetFrame / project.fps)}s`;
  } else if (p.includes("teal") || p.includes("color grade") || p.includes("cinematic") || p.includes("lut")) {
    commands.push({
      id: `cmd-${Date.now()}-2`,
      action: "APPLY_SHADER",
      parameters: {
        type: "lut",
        preset: "moody-teal-orange",
        intensity: 0.9
      },
      description: "Apply cinematic Teal & Orange LUT color grade across video tracks"
    });
    summary = "Color graded timeline with cinematic Moody Teal & Orange LUT";
  } else if (p.includes("zoom") || p.includes("push in")) {
    commands.push({
      id: `cmd-${Date.now()}-3`,
      action: "APPLY_SHADER",
      parameters: {
        scaleStart: 1.0,
        scaleEnd: 1.25,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      description: "Applied smooth slow push-in zoom to active scene clip"
    });
    summary = "Added slow push-in zoom camera keyframes";
  } else if (p.includes("faster") || p.includes("pacing") || p.includes("speed")) {
    commands.push({
      id: `cmd-${Date.now()}-4`,
      action: "RETIME_CLIP",
      parameters: { speedMultiplier: 1.2 },
      description: "Speed up timeline playback pacing by 20%"
    });
    summary = "Increased sequence speed by 1.2x";
  } else {
    commands.push({
      id: `cmd-${Date.now()}-5`,
      action: "AUTO_SUBTITLES",
      parameters: { style: "hormozi-yellow" },
      description: "Generate and align dynamic animated viral captions on Track C1"
    });
    summary = `Parsed: "${prompt}" and prepared automated timeline optimization`;
  }

  return {
    id: `proposal-${Date.now()}`,
    userPrompt: prompt,
    summary,
    commands,
    status: "pending_review",
    timestamp: new Date().toISOString()
  };
}

export function applyEditProposal(
  project: TimelineProject,
  proposal: EditProposal
): TimelineProject {
  let updated = { ...project };

  for (const cmd of proposal.commands) {
    if (cmd.action === "RAZOR_SPLIT" && cmd.atFrame !== undefined) {
      for (const track of updated.tracks) {
        for (const clip of track.clips) {
          if (cmd.atFrame > clip.startFrame && cmd.atFrame < clip.startFrame + clip.durationFrames) {
            updated = splitClipAtFrame(updated, clip.id, cmd.atFrame);
          }
        }
      }
    } else if (cmd.action === "APPLY_SHADER") {
      updated = {
        ...updated,
        tracks: updated.tracks.map((t) => {
          if (t.type !== "video") return t;
          return {
            ...t,
            clips: t.clips.map((c) => ({
              ...c,
              effects: [
                ...c.effects.filter((e) => e.type !== "lut"),
                {
                  id: `lut-${Date.now()}`,
                  type: "lut",
                  name: "Moody Teal & Orange",
                  enabled: true,
                  intensity: 0.9,
                  parameters: { preset: "teal-orange" }
                }
              ]
            }))
          };
        })
      };
    }
  }

  return updated;
}
