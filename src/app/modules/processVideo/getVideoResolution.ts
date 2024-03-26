// eslint-disable-next-line import/no-named-as-default
import FfmpegCommand from "fluent-ffmpeg";

import { VideoResolution } from "./types";

export default function getVideoResolution(path: string): Promise<VideoResolution> {
  return new Promise<VideoResolution>((resolve) => {
    FfmpegCommand()
      .input(path)
      .ffprobe((error, data) => {
        if (error) {
          throw `Cannot get video resolution!\n${error}`;
        }

        const width = data.streams[0]?.coded_width;
        const height = data.streams[0]?.coded_height;

        if (!width) throw new Error("Cannot get video width!");
        if (!height) throw new Error("Cannot get video height!");

        resolve(`${width}x${height}`);
      });
  });
}
