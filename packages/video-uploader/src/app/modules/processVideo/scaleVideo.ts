import path from "node:path";

import { ScaleVideoOptions } from "./types";

export default function scaleVideo(scaleVideoOptions: ScaleVideoOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const worker = new Worker(path.join(import.meta.dirname, "scaleVideoWorker.ts"));

    worker.postMessage(scaleVideoOptions);

    worker.addEventListener("message", () => {
      worker.terminate();
      resolve();
    });

    worker.addEventListener("error", (error) => {
      worker.terminate();
      reject(`Cannot scale video!\n${error.message}`);
    });
  });
}
