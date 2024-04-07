// eslint-disable-next-line import-x/no-named-as-default
import FfmpegCommand from "fluent-ffmpeg";

export default function getVideoDurationSec(path: string): Promise<number> {
  return new Promise<number>((resolve) => {
    FfmpegCommand()
      .input(path)
      .ffprobe((error, data) => {
        if (error) {
          throw `Cannot get video duration!\n${error}`;
        }

        const duration = data.format.duration;
        if (!duration) throw new Error("Cannot get video duration!");

        resolve(duration);
      });
  });
}
