import { main, TelegramMessage } from "./app";

interface Environment {
  TELEGRAM_BOT_TOKEN?: string;
  ALLOWED_USERS?: string;
  ACTIONS_ACCESS_TOKEN?: string;
  TARGET_REPOSITORY?: string;
  WORKFLOW_ID?: string;
}

function isValidRequest(request: Request): boolean {
  const { method, url, headers } = request;
  return (
    method === "POST" &&
    new URL(url).pathname === "/webhooks/telegram" &&
    headers.get("content-type") === "application/json"
  );
}

export default {
  async fetch(request: Request, environment: Environment): Promise<Response> {
    if (!isValidRequest(request)) {
      return new Response("Invalid request", { status: 400 });
    }

    const {
      TELEGRAM_BOT_TOKEN: telegramBotToken,
      ALLOWED_USERS: allowedUsers,
      ACTIONS_ACCESS_TOKEN: actionsAccessToken,
      TARGET_REPOSITORY: targetRepository,
      WORKFLOW_ID: workflowId,
    } = environment;

    if (
      !actionsAccessToken ||
      !telegramBotToken ||
      !allowedUsers ||
      !targetRepository ||
      !workflowId
    ) {
      return new Response("Missing environment variables");
    }

    const allowedUserIDs = allowedUsers.split(",");

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const { message } = (await request.json()) as { message: TelegramMessage };

    return await main({
      message,
      telegramBotToken,
      allowedUserIDs,
      actionsAccessToken,
      targetRepository,
      workflowId,
    });
  },
};
