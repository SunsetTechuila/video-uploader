export { default as SecretsStorage, type Repository } from "./secretsStorage";

export {
  default as TelegramUploader,
  type TelegramCredentials,
  type UploadVideoOptions,
  type SendableVideo,
} from "./telegramUploader";

export {
  default as YouTubeUploader,
  type YouTubeCredentials,
  type SaveCredentialsCallback,
  type UploadOptions,
  type VideoPrivacy,
} from "./youtubeUploader";

export {
  scaleVideo,
  getVideoDurationSec,
  getVideoResolution,
  saveVideoFrame,
  type VideoResolution,
  type ScaleVideoOptions,
} from "./processVideo";

export {
  default as downloadVideo,
  type DownloadOptions,
  type VideoFormat,
  type Downloader,
} from "./downloadVideo";
