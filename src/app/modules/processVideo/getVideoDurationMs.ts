// eslint-disable-next-line import/no-named-as-default
import FfmpegCommand from "fluent-ffmpeg";

export default function getVideoDurationMs(path: string): Promise<number> {
  return new Promise<number>((resolve) => {
    FfmpegCommand()
      .input(path)
      .ffprobe((error, data) => {
        if (error) {
          throw `Cannot get video duration!\n${error}`;
        }

        const durationSeconds = data.format.duration;
        if (!durationSeconds) throw new Error("Cannot get video duration!");

        resolve(durationSeconds * 1000);
      });
  });
}
