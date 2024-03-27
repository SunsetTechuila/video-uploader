// eslint-disable-next-line import/no-named-as-default
import FfmpegCommand from "fluent-ffmpeg";

export default async function saveVideoFrame(
  path: string,
  outFile: string,
  time = "00:00:00",
): Promise<void> {
  return new Promise<void>((resolve) => {
    FfmpegCommand()
      .input(path)
      .outputOptions(["-vframes 1", `-ss ${time}`, "-q:v 2"])
      .on("error", (error) => {
        throw new Error(`Cannot get video frame!\n${error}`);
      })
      .on("end", () => {
        resolve();
      })
      .save(outFile);
  });
}
