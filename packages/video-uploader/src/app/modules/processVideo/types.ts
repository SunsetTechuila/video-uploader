export type VideoResolution = `${number}x${number}`;

export interface ScaleVideoOptions {
  path: string;
  targetResolution: VideoResolution;
  outFile: string;
}

export interface CompressVideoOptions {
  path: string;
  targetSizeMB: number;
  outFile: string;
}
