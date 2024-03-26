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
  message?: string;
  retries?: number;
}

export default class TelegramUploader {
  readonly #telegramClient;

  readonly #channel;

  private constructor(telegramClient: TelegramClient, channel: string) {
    this.#telegramClient = telegramClient;
    this.#channel = channel;
  }

  public static async create(
    telegramCredentials: TelegramCredentials,
    channel: string,
  ): Promise<TelegramUploader> {
    const telegramClient = new TelegramUploader(
      new TelegramClient(
        new StringSession(telegramCredentials.session),
        telegramCredentials.apiId,
        telegramCredentials.apiHash,
        {},
      ),
      channel,
    );

    await telegramClient.#telegramClient.connect();

    return telegramClient;
  }

  public async sendMessage(message: string, shouldShowPreview = false): Promise<void> {
    await this.#telegramClient.sendMessage(this.#channel, {
      message,
      linkPreview: shouldShowPreview,
    });
  }

  public async uploadVideo(video: SendableVideo, options: UploadVideoOptions): Promise<void> {
    const { thumbnail, message, retries = 3 } = options;

    const attributes = [
      new Api.DocumentAttributeVideo({
        duration: video.duration,
        h: video.height,
        w: video.width,
        supportsStreaming: true,
      }),
    ];

    try {
      await this.#telegramClient.sendMessage(this.#channel, {
        file: video.path,
        thumb: thumbnail,
        attributes,
        message,
        supportStreaming: true,
      });
    } catch (error) {
      if (retries > 0) {
        console.error(`Failed to upload video: ${video.path}`);
        console.info(`Retrying... Remaining attempts: ${retries}`);
        await this.uploadVideo(video, { thumbnail, message, retries: retries - 1 });
      } else {
        throw error;
      }
    }
  }

  public async disconnect(): Promise<void> {
    await this.#telegramClient.disconnect();
  }
}
