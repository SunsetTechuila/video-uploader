# Video Uploader

## How to Set Up the Uploader

**These instructions assume that you have [forked](https://docs.github.com/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) this repository. Any specified action is done on your fork.**

After completing one or both of the given instructions you should be able to upload videos by [manually triggering](https://docs.github.com/actions/using-workflows/manually-running-a-workflow) the _Upload Video_ workflow.

### For Uploading to YouTube

1. [Generate a GitHub fine-grained personal access token](https://docs.github.com/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with **Write acess to your forked repository Secrets** and copy its value
2. [Create a secret](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) named _SECRETS_ACCESS_TOKEN_ and and use the previously copied token as its value
3. [Create a variable](https://docs.github.com/actions/learn-github-actions/variables#creating-configuration-variables-for-a-repository) named _UPLOAD_TO_YOUTUBE_ with `true` value
4. [Manually trigger](<(https://docs.github.com/actions/using-workflows/manually-running-a-workflow)>) the _Upload Video_ workflow

   > The following steps are only required for setting the uploader up, you will not need to perform them for further use.

5. Reload the page and then click the running workflow name
6. Click the _upload_ tile
7. Wait until you see the _go to google.com/device and enter the code_ message and then do what it says

### For Uploading to Telegram

1. [Obtain your Telegram app api_id and api_hash](https://core.telegram.org/api/obtaining_api_id)
2. [Create secrets for your repository](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) with names _TELEGRAM_API_ID_, _TELEGRAM_API_HASH_ and corresponding values
3. Create a secret named _TELEGRAM_CHANNEL_ with the target Telegram channel ID or username as its value
4. [Install Bun](https://bun.sh/docs/installation)
5. [Clone](https://docs.github.com/repositories/creating-and-managing-repositories/cloning-a-repository) this repository
6. Open any termal and navigate to the _packages/video-uploader_ folder
7. Run `bun i`
8. Run `bun get-tg-session`, log in to your Telegram account and copy the printed session value.

   > Given account will be used to upload videos, so better to have the [Telegram Premium subscription](https://telegram.org/faq_premium) – this will allow videos larger than 4 gigabytes to be uploaded without additional compression.

9. Create a secret named _TELEGRAM_SESSION_ and use the previously copied session as its value
10. [Create a variable](https://docs.github.com/actions/learn-github-actions/variables#creating-configuration-variables-for-a-repository) named _UPLOAD_TO_TELEGRAM_ with `true` value

## How to Set Up the Trigger Bot

The trigger bot is a Telegram bot that you can send a direct link to a video and it will trigger the _Upload Video_ workflow with it.

**These instructions assume that you have already [set up the uploader.](#how-to-set-up-the-uploader)**

1. [Create a new Telegram bot](https://core.telegram.org/bots/features#creating-a-new-bot)
2. [Sign up to Cloudflare](https://dash.cloudflare.com/sign-up)
3. [Generate a GitHub fine-grained personal access token](https://docs.github.com/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with **Write acess to your forked repository Actions** and copy its value
4. Install [Node.js](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) and [Bun](https://bun.sh/docs/installation)
5. [Clone](https://docs.github.com/repositories/creating-and-managing-repositories/cloning-a-repository) this repository
6. Edit the _wrangler.toml_ file in the _packages/trigger-bot_ forlder: change `SunsetTechuila` to your GitHub account name
7. Open any termal and navigate to the _packages/trigger-bot_ folder
8. Run `bun i`
9. Run `bun wrangler login` and log in to your previously created Cloudflare account
10. Run `bun wrangler secrets put TELEGRAM_BOT_TOKEN` and enter the token given to you by BotFather
11. Run `bun wrangler secrets put ACTIONS_ACCESS_TOKEN` and enter the GitHub token you previously generated
12. Run `bun wrangler secrets put ALLOWED_USERS` and enter the [IDs of the Telegram accounts](https://www.google.com/search?q=how+to+get+telegram+id) to which you want to give access to the bot, **without spaces and separated by commas**
13. Run `bun deploy`
14. In the console output you will see the the link to your worker. Copy it.
15. Follow this link: `https://api.telegram.org/bot<your bot token>/setWebhook?url=<your worker url>/webhooks/telegram`

## How to Speed Up the Uploader

You have two options:

1. [Self-host a runner](https://docs.github.com/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners) (highly recommended)
2. [Use GitHub large runners](https://docs.github.com/actions/using-github-hosted-runners/about-larger-runners/about-larger-runners)
