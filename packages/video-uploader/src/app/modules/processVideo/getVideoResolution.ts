// eslint-disable-next-line import-x/no-named-as-default
import FfmpegCommand from "fluent-ffmpeg";

import { VideoResolution } from "./types";

export default async function getVideoResolution(path: string): Promise<VideoResolution> {
  return await new Promise<VideoResolution>((resolve, reject) => {
    FfmpegCommand()
      .input(path)
      .ffprobe((error, data) => {
        if (error) {
          reject(`Cannot get video resolution!\n${error}`);
          return;
        }

        const width = data.streams[0]?.coded_width;
        const height = data.streams[0]?.coded_height;

        if (!width) {
          reject("Cannot get video width!");
          return;
        }
        if (!height) {
          reject("Cannot get video height!");
          return;
        }

        resolve(`${width}x${height}`);
      });
  });
}
