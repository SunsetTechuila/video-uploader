export type VideoResolution = `${number}x${number}`;

export interface ScaleVideoOptions {
  path: string;
  targetResolution: VideoResolution;
  outFile: string;
}
