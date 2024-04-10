import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

export interface TelegramCredentials {
  apiId: number;
  apiHash: string;
  session: string;
}

export interface SendableVideo {
  path: string;
  duration: number;
  width: number;
  height: number;
}

export interface UploadVideoOptions {
  thumbnail?: string;
  caption?: string;
  retries?: number;
}

export default class TelegramUploader {
  readonly fileSizeLimitMB;

  readonly #client;

  readonly #channel;

  private constructor(client: TelegramClient, channel: string, fileSizeLimitMB: number) {
    this.#client = client;
    this.#channel = channel;
    this.fileSizeLimitMB = fileSizeLimitMB;
  }

  static async create(
    credentials: TelegramCredentials,
    channel: string,
  ): Promise<TelegramUploader> {
    const telegramClient = new TelegramClient(
      new StringSession(credentials.session),
      credentials.apiId,
      credentials.apiHash,
      {},
    );

    await telegramClient.connect();

    const { premium } = await telegramClient.getMe();
    const fileSizeLimitMB = premium ? 4000 : 2000;

    return new TelegramUploader(telegramClient, channel, fileSizeLimitMB);
  }

  async sendMessage(message: string, shouldShowPreview = false): Promise<void> {
    await this.#client.sendMessage(this.#channel, {
      message,
      linkPreview: shouldShowPreview,
    });
  }

  async uploadVideo(video: SendableVideo, options: UploadVideoOptions): Promise<void> {
    const { thumbnail, caption, retries = 3 } = options;

    const attributes = [
      new Api.DocumentAttributeVideo({
        duration: video.duration,
        h: video.height,
        w: video.width,
        supportsStreaming: true,
      }),
    ];

    try {
      await this.#client.sendFile(this.#channel, {
        file: video.path,
        thumb: thumbnail,
        attributes,
        caption,
        supportsStreaming: true,
        workers: 8,
      });
    } catch (error) {
      if (retries > 0) {
        console.error(`Failed to upload video: ${video.path}`);
        console.info(`Retrying... Remaining attempts: ${retries}`);
        await Bun.sleep(1000);
        await this.uploadVideo(video, { thumbnail, caption, retries: retries - 1 });
      } else {
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.#client.disconnect();
  }
}
