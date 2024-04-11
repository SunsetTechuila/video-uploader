function isValidUrl(input?: unknown): input is string {
  if (typeof input !== "string") return false;

  try {
    return Boolean(new URL(input));
  } catch {
    return false;
  }
}

function isAllowedUser(userId: string, allowedUserIDs: string[]): boolean {
  return allowedUserIDs.includes(userId);
}

class TelegramBot {
  #token;

  #chatId;

  constructor(token: string, chatId: number) {
    this.#token = token;
    this.#chatId = chatId;
  }

  async send(message: string): Promise<Response> {
    return await fetch(`https://api.telegram.org/bot${this.#token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: this.#chatId, text: message }),
    });
  }
}

export interface TriggerWorkflowOptions {
  inputs: Record<string, string>;
  actionsAccessToken: string;
  targetRepository: string;
  workflowId: string;
}

async function triggerWorkflow(options: TriggerWorkflowOptions): Promise<Response> {
  const { inputs, actionsAccessToken, targetRepository, workflowId } = options;

  return await fetch(
    `https://api.github.com/repos/${targetRepository}/actions/workflows/${workflowId}/dispatches`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${actionsAccessToken}`,
        "User-Agent": "trigger-bot",
      },
      body: JSON.stringify({
        ref: "master",
        inputs,
      }),
    },
  );
}

export interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text: string;
}

export interface MainOptions {
  message: TelegramMessage;
  telegramBotToken: string;
  allowedUserIDs: string[];
  actionsAccessToken: string;
  targetRepository: string;
  workflowId: string;
}

export async function main(options: MainOptions): Promise<Response> {
  const {
    message,
    telegramBotToken,
    allowedUserIDs,
    actionsAccessToken,
    targetRepository,
    workflowId,
  } = options;

  const messageText = message.text.trim();
  const chatId = message.chat.id;

  const bot = new TelegramBot(telegramBotToken, chatId);

  if (!isAllowedUser(message.from.id.toString(), allowedUserIDs)) {
    await bot.send("You are not allowed to use this bot");
    return new Response("Not allowed");
  }
  if (!isValidUrl(messageText)) {
    await bot.send("Message text is not a valid URL");
    return new Response("Message text is not a valid URL");
  }

  const response = await triggerWorkflow({
    inputs: { link: messageText },
    actionsAccessToken,
    targetRepository,
    workflowId,
  });

  if (response.ok) {
    await bot.send("Action triggered successfully");
    return new Response("Action triggered successfully");
  } else {
    await bot.send(`Failed to trigger the action.\n${await response.text()}`);
    return new Response("Failed to trigger the action");
  }
}
