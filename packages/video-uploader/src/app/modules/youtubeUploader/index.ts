import { Innertube, Credentials } from "youtubei.js";
import path from "node:path";

export type YouTubeCredentials = Credentials;

export type SaveCredentialsCallback = (credentials: YouTubeCredentials) => unknown;

export type VideoPrivacy = "PUBLIC" | "PRIVATE" | "UNLISTED";

export interface UploadOptions {
  title?: string;
  description?: string;
  privacy?: VideoPrivacy;
}

export default class YouTubeUploader {
  readonly #innertubeClient;

  private constructor(innertubeClient: Innertube) {
    this.#innertubeClient = innertubeClient;
  }

  public static async create(
    credentials?: YouTubeCredentials,
    saveCredentialsCallback?: SaveCredentialsCallback,
  ): Promise<YouTubeUploader> {
    const youtubeUploader = new YouTubeUploader(await Innertube.create());

    const actualCredentials = await youtubeUploader.#signIn(credentials);
    if (saveCredentialsCallback) await saveCredentialsCallback(actualCredentials);

    return youtubeUploader;
  }

  public async uploadVideo(videoPath: string, options: UploadOptions = {}): Promise<void> {
    const { privacy = "PRIVATE", title, description } = options;
    const videoFile = Bun.file(videoPath);

    const result = await this.#innertubeClient.studio.upload(await videoFile.arrayBuffer(), {
      title: title ?? path.parse(videoPath).name,
      description,
      privacy,
    });

    if (!result.success) {
      throw new Error(`Failed to upload video! Status code: ${result.status_code}`);
    }
  }

  #signIn(credentials?: YouTubeCredentials): Promise<YouTubeCredentials> {
    return new Promise((resolve, reject) => {
      this.#innertubeClient.session.on("auth", ({ credentials }) => {
        resolve(credentials);
      });

      this.#innertubeClient.session.on("update-credentials", ({ credentials }) => {
        resolve(credentials);
      });

      this.#innertubeClient.session.on("auth-pending", ({ verification_url, user_code }) => {
        console.info(`\nGo to ${verification_url} and enter the code ${user_code}`);
      });

      this.#innertubeClient.session.on("auth-error", (error) => {
        reject(`Failed to sign in to YouTube!\n${error.message}`);
      });

      void this.#innertubeClient.session.signIn(credentials);
    });
  }
}
