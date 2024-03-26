import { SecretsStorage, Repository, YouTubeUploader, YouTubeCredentials } from "@modules";

export interface UploadToYouTubeOptions {
  videoPath: string;
  githubToken: string;
  workRepository: Repository;
  youtubeCredentials: string;
}

const YOUTUBE_CREDENTIALS_SECRET_NAME = "YOUTUBE_CREDENTIALS";

export async function uploadToYouTube(options: UploadToYouTubeOptions) {
  const { videoPath, githubToken, workRepository, youtubeCredentials } = options;
  const secretsStorage = new SecretsStorage(githubToken, workRepository);

  const credentialsToPass = youtubeCredentials
    ? (JSON.parse(youtubeCredentials) as YouTubeCredentials)
    : undefined;

  const saveCredentialsCallback = async (credentials: YouTubeCredentials) => {
    console.info("Signed in to YouTube");
    await secretsStorage.set(YOUTUBE_CREDENTIALS_SECRET_NAME, JSON.stringify(credentials));
    console.info("YouTube credentials saved to GitHub repo secrets");
  };

  const youtubeUploader = await YouTubeUploader.create(credentialsToPass, saveCredentialsCallback);

  console.info("Uploading video to YouTube");
  await youtubeUploader.uploadVideo(videoPath, { privacy: "UNLISTED" });
  console.info("Video uploaded to YouTube");
}
