import path from "node:path";

import {
  getVideoResolution,
  getVideoDurationSec,
  getVideoSizeMB,
  compressVideo,
  scaleVideo,
  saveVideoFrame,
  ScaleVideoOptions,
  VideoResolution,
  TelegramUploader,
  TelegramCredentials,
} from "@modules";

export interface UploadToTelegramOptions {
  videoLink: string;
  videoPath: string;
  telegramCredentials: TelegramCredentials;
  telegramChannel: string;
}

const TARGET_VIDEO_RESOLUTIONS: VideoResolution[] = [
  "4096x2160",
  "1920x1080",
  "1280x720",
  "640x480",
];

export async function uploadToTelegram(options: UploadToTelegramOptions): Promise<void> {
  const { videoLink, videoPath, telegramCredentials, telegramChannel } = options;

  const currentVideoResolution = await getVideoResolution(videoPath);
  if (!TARGET_VIDEO_RESOLUTIONS.includes(currentVideoResolution)) {
    throw new Error(
      `Unsupported video resolution! Current: ${currentVideoResolution}, supported: ${TARGET_VIDEO_RESOLUTIONS.join(", ")}`,
    );
  }
  const resolutionsToScaleTo = TARGET_VIDEO_RESOLUTIONS.slice(
    TARGET_VIDEO_RESOLUTIONS.indexOf(currentVideoResolution) + 1,
  );

  const telegramUploader = await TelegramUploader.create(telegramCredentials, telegramChannel);

  const { name: videoName } = path.parse(videoPath);
  await telegramUploader.sendMessage(`${videoName}\n${videoLink}`);

  const { fileSizeLimitMB } = telegramUploader;
  const isVideoSizeExceeded = (await getVideoSizeMB(videoPath)) > fileSizeLimitMB;
  const compressedVideoPath = insertStringToFileName(videoPath, "compressed");
  const targetVideoPath = isVideoSizeExceeded ? compressedVideoPath : videoPath;
  if (isVideoSizeExceeded) {
    console.info("Compressing video");
    await compressVideo({
      path: videoPath,
      targetSizeMB: fileSizeLimitMB,
      outFile: compressedVideoPath,
    });
  }

  await scaleVideoAndUpload({
    videoPath: targetVideoPath,
    videoName,
    resolutionsToScaleTo,
    telegramUploader,
    uploadPromise: uploadVideo({ videoName, videoPath: targetVideoPath, telegramUploader }),
  });

  console.info("All versions of the video uploaded to Telegram");
  await telegramUploader.disconnect();
}

interface ScaleVideoAndUploadOptions {
  videoName: string;
  videoPath: string;
  resolutionsToScaleTo: VideoResolution[];
  telegramUploader: TelegramUploader;
  uploadPromise?: Promise<unknown>;
}
async function scaleVideoAndUpload(options: ScaleVideoAndUploadOptions): Promise<void> {
  const { videoName, videoPath, resolutionsToScaleTo, telegramUploader, uploadPromise } = options;

  const [resolutionToScaleTo, nextResolutionToScaleTo] = resolutionsToScaleTo;
  if (!resolutionToScaleTo) {
    await uploadPromise;
    return;
  }

  const scaledVideoPath = insertStringToFileName(videoPath, resolutionToScaleTo);
  await scaleVideoWithLogs({
    path: videoPath,
    targetResolution: resolutionToScaleTo,
    outFile: scaledVideoPath,
  });

  const newUploadPromise = uploadPromise
    ? uploadPromise.then(() => {
        return uploadVideo({ videoName, videoPath: scaledVideoPath, telegramUploader });
      })
    : uploadVideo({ videoName, videoPath: scaledVideoPath, telegramUploader });

  // eslint-disable-next-line unicorn/prefer-ternary
  if (nextResolutionToScaleTo) {
    await scaleVideoAndUpload({
      videoName,
      videoPath: scaledVideoPath,
      resolutionsToScaleTo: resolutionsToScaleTo.slice(1),
      telegramUploader,
      uploadPromise: newUploadPromise,
    });
  } else {
    await newUploadPromise;
  }
}

interface UploadVideoOptions {
  videoName: string;
  videoPath: string;
  telegramUploader: TelegramUploader;
}
async function uploadVideo(options: UploadVideoOptions): Promise<void> {
  const { videoName, videoPath, telegramUploader } = options;

  const { resolution, height, width, duration } = await getVideoInfo(videoPath);
  const thumbnail = `${videoName} ${resolution}.jpg`;
  await saveVideoFrame(videoPath, thumbnail);
  const video = {
    path: videoPath,
    duration,
    width,
    height,
  };

  console.info(`Uploading video with resolution ${resolution} to Telegram`);
  await telegramUploader.uploadVideo(video, { thumbnail, caption: `${videoName} ${resolution}` });
  console.info(`Video with resolution ${resolution} uploaded to Telegram`);
}

async function scaleVideoWithLogs(scaleVideoOptions: ScaleVideoOptions): Promise<void> {
  const { targetResolution } = scaleVideoOptions;
  console.info(`Scaling video to ${targetResolution}`);
  await scaleVideo(scaleVideoOptions);
  console.info(`Video scaled to ${targetResolution}`);
}

interface VideoInfo {
  resolution: VideoResolution;
  width: number;
  height: number;
  duration: number;
}
async function getVideoInfo(videoPath: string): Promise<VideoInfo> {
  const resolution = await getVideoResolution(videoPath);
  const { width, height } = parseVideoResolution(resolution);
  const duration = await getVideoDurationSec(videoPath);

  return { resolution, width, height, duration };
}

function insertStringToFileName(filePath: string, stringToInsert: string) {
  const { dir, name, ext } = path.parse(filePath);
  const fileName = `${name} ${stringToInsert}${ext}`;

  return path.join(dir, fileName);
}

function parseVideoResolution(resolution: VideoResolution) {
  const [width, height] = resolution.split("x").map((value) => Number.parseInt(value, 10));
  if (!width || !height) {
    throw new Error(`Cannot parse video resolution ${resolution}`);
  }

  return { width, height };
}
