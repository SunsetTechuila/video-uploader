import YTDlpWrap from "yt-dlp-wrap";
import path from "node:path";

export type VideoFormat = "3gp" | "flv" | "mp4" | "webm";

export type Downloader = "aria2c" | "avconv" | "axel" | "curl" | "ffmpeg" | "httpie" | "wget";

export interface DownloadOptions {
  format?: VideoFormat;
  downloader?: Downloader;
  output?: string;
}

export default async function downloadVideo(
  url: string,
  options: DownloadOptions = {},
): Promise<string> {
  const { downloader = "aria2c", output = path.resolve("%(title)s.%(ext)s") } = options;
  const ytDlp = new YTDlpWrap();

  await ytDlp.execPromise([url, "--downloader", downloader, "--output", output]);

  const videoFileName = await ytDlp.execPromise([
    url,
    "--get-filename",
    "--encoding",
    // eslint-disable-next-line unicorn/text-encoding-identifier-case
    "utf-8",
    "--output",
    output,
  ]);

  // trim yt-dlp output to remove newline
  return path.resolve(videoFileName.trim());
}
