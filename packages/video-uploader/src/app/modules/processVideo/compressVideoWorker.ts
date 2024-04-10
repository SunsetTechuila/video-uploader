// eslint-disable-next-line import-x/no-named-as-default
import FfmpegCommand from "fluent-ffmpeg";

import { getVideoDurationSec } from ".";
import { CompressVideoOptions } from "./types";

async function compressVideo(compressVideoArguments: CompressVideoOptions): Promise<void> {
  const { path, targetSizeMB, outFile } = compressVideoArguments;
  const durationSec = await getVideoDurationSec(path);
  const targetSizeKb = targetSizeMB * 1024 * 8;
  const targetBitRateKbps = Math.floor(targetSizeKb / durationSec);

  const baseCommand = FfmpegCommand()
    .input(path)
    .output(outFile)
    .videoCodec("libx264")
    .videoBitrate(targetBitRateKbps)
    .audioCodec("copy");

  await new Promise<void>((resolve, reject) => {
    baseCommand
      .outputOptions("-pass 1")
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        resolve();
      })
      .run();
  });

  return await new Promise<void>((resolve, reject) => {
    baseCommand
      .outputOptions("-pass 2")
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        resolve();
      })
      .run();
  });
}

declare const self: Worker;

self.addEventListener("message", ({ data }) => {
  const infoToCompressVideo = data as CompressVideoOptions;
  void compressVideo(infoToCompressVideo).then(() => self.postMessage("success"));
});
