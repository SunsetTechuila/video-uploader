import path from "node:path";

import { ScaleVideoOptions } from "./types";

export default function scaleVideo(scaleVideoArguments: ScaleVideoOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    const worker = new Worker(path.join(import.meta.dirname, "scaleVideoWorker.ts"));

    worker.postMessage(scaleVideoArguments);

    worker.addEventListener("message", () => {
      worker.terminate();
      resolve();
    });

    worker.addEventListener("error", (error) => {
      worker.terminate();
      throw `Cannot scale video!\n${error.message}`;
    });
  });
}
