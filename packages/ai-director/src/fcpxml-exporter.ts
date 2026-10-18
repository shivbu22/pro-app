import { TimelineProject } from "@omnicut/shared-types";

export function exportToFCPXML(project: TimelineProject): string {
  const fps = project.fps;
  const width = project.width;
  const height = project.height;

  let clipsXml = "";
  project.tracks.forEach((track) => {
    track.clips.forEach((clip) => {
      clipsXml += `
        <video name="${clip.name}" offset="${clip.startFrame}/${fps}s" duration="${clip.durationFrames}/${fps}s" start="${clip.sourceStartFrame}/${fps}s">
          <adjust-transform position="${clip.position.x} ${clip.position.y}" scale="${clip.scale} ${clip.scale}"/>
        </video>`;
    });
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat${height}p${fps}" frameDuration="1/${fps}s" width="${width}" height="${height}"/>
  </resources>
  <library>
    <event name="OmniCut Export">
      <project name="${project.title}">
        <sequence format="r1" duration="${project.durationFrames}/${fps}s">
          <spine>
            ${clipsXml}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
}
