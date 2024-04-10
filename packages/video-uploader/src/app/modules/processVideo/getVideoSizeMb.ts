// eslint-disable-next-line import-x/no-named-as-default
import FfmpegCommand from "fluent-ffmpeg";

const BYTES_IN_MEGABYTE = 1000 * 1000;

export default function getVideoSizeMB(path: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    FfmpegCommand()
      .input(path)
      .ffprobe((error, data) => {
        if (error) {
          reject(`Cannot get video size!\n${error}`);
          return;
        }

        const { size } = data.format;
        if (!size) {
          reject("Cannot get video size!");
          return;
        }

        resolve(size / BYTES_IN_MEGABYTE);
      });
  });
}
