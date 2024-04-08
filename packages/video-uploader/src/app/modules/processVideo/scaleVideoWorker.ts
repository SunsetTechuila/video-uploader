// eslint-disable-next-line import-x/no-named-as-default
import FfmpegCommand from "fluent-ffmpeg";

import { ScaleVideoOptions } from "./types";

declare const self: Worker;

function scaleVideo(scaleVideoArguments: ScaleVideoOptions): Promise<void> {
  const { path, targetResolution, outFile } = scaleVideoArguments;

  return new Promise<void>((resolve, reject) => {
    FfmpegCommand()
      .input(path)
      .audioCodec("copy")
      .size(targetResolution)
      .autopad()
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        resolve();
      })
      .save(outFile);
  });
}

self.addEventListener("message", ({ data }) => {
  const infoToScaleVideo = data as ScaleVideoOptions;
  void scaleVideo(infoToScaleVideo).then(() => self.postMessage("success"));
});
