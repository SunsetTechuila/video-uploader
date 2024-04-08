// eslint-disable-next-line import-x/no-named-as-default
import FfmpegCommand from "fluent-ffmpeg";

export default function getVideoDurationSec(path: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    FfmpegCommand()
      .input(path)
      .ffprobe((error, data) => {
        if (error) {
          reject(`Cannot get video duration!\n${error}`);
          return;
        }

        const duration = data.format.duration;
        if (!duration) {
          reject("Cannot get video duration!");
          return;
        }

        resolve(duration);
      });
  });
}
