import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { input } from "@inquirer/prompts";

async function getInput(message: string): Promise<string> {
  return input({ message, validate: Boolean });
}

const apiId = await getInput("Please enter your app API ID: ");
const apiHash = await getInput("Please enter your app API hash: ");

const client = new TelegramClient(new StringSession(""), Number(apiId), apiHash, {});

await client.start({
  phoneNumber: async () => await getInput("Please enter your number: "),
  password: async () => await getInput("Please enter your password: "),
  phoneCode: async () => await getInput("Please enter the code you received: "),
  onError: (error) => {
    throw error;
  },
});

console.log(client.session.save());
