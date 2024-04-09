import path from "node:path";

import { CompressVideoOptions } from "./types";

export default function compressVideo(compressVideoOptions: CompressVideoOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const worker = new Worker(path.join(import.meta.dirname, "compressVideoWorker.ts"));

    worker.postMessage(compressVideoOptions);

    worker.addEventListener("message", () => {
      worker.terminate();
      resolve();
    });

    worker.addEventListener("error", (error) => {
      worker.terminate();
      reject(`Cannot compress video!\n${error.message}`);
    });
  });
}
