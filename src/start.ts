import main from "@app";

const videoLink = process.argv[2];
const {
  githubToken,
  uploadToYouTube,
  uploadToTelegram,
  telegramApiId,
  telegramApiHash,
  telegramSession,
  telegramChannel,
  youtubeCredentials,
} = process.env;

if (!videoLink) throw new Error("Video link is required!");

const shouldUploadToYouTube = uploadToYouTube?.toUpperCase() === "TRUE";
const shouldUploadToTelegram = uploadToTelegram?.toUpperCase() === "TRUE";

let telegramCredentials;
if (shouldUploadToTelegram) {
  if (!telegramApiId?.length) throw new Error("Telegram app API ID is required!");
  if (!telegramApiHash?.length) throw new Error("Telegram app API hash is required!");
  if (!telegramSession?.length) throw new Error("Telegram app session is required!");
  if (!telegramChannel?.length) throw new Error("Target Telegram channel is required!");

  telegramCredentials = {
    apiId: Number(telegramApiId),
    apiHash: telegramApiHash,
    session: telegramSession,
  };

  if (!Bun.which("ffmpeg")) throw new Error("FFmpeg is not installed!");
}

let workRepository;
if (shouldUploadToYouTube) {
  if (!githubToken?.length) throw new Error("GitHub token is required!");

  const [owner, name] = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
  if (!owner || !name) {
    throw new Error("Can't get current repository owner and name!");
  }
  workRepository = {
    owner,
    name,
  };

  if (!Bun.which("yt-dlp")) throw new Error("yt-dlp is not installed!");
}

await main({
  videoLink,
  shouldUploadToYouTube,
  shouldUploadToTelegram,
  githubToken,
  workRepository,
  youtubeCredentials,
  telegramCredentials,
  telegramChannel,
});
