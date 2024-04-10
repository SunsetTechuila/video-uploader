import { downloadVideo, Repository, TelegramCredentials } from "@modules";
import { uploadToYouTube } from "./uploadToYoutube";
import { uploadToTelegram } from "./uploadToTelegram";

export interface MainOptions {
  videoLink: string;
  shouldUploadToYouTube: boolean;
  shouldUploadToTelegram: boolean;
  githubToken?: string;
  workRepository?: Repository;
  youtubeCredentials?: string;
  telegramCredentials?: TelegramCredentials;
  telegramChannel?: string;
}

export default async function main(options: MainOptions): Promise<void> {
  const {
    videoLink,
    shouldUploadToYouTube,
    shouldUploadToTelegram,
    githubToken,
    workRepository,
    youtubeCredentials,
    telegramCredentials,
    telegramChannel,
  } = options;

  console.info("Downloading video");
  const videoPath = await downloadVideo(videoLink);
  console.info("Video downloaded");

  const promises = new Set<Promise<unknown>>();

  if (shouldUploadToYouTube) {
    promises.add(
      uploadToYouTube({
        videoPath,
        githubToken: githubToken!,
        workRepository: workRepository!,
        youtubeCredentials: youtubeCredentials!,
      }),
    );
  }

  if (shouldUploadToTelegram) {
    promises.add(
      uploadToTelegram({
        videoLink,
        videoPath,
        telegramCredentials: telegramCredentials!,
        telegramChannel: telegramChannel!,
      }),
    );
  }

  await Promise.allSettled(promises);
}
