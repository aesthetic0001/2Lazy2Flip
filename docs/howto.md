<h1 align="center">How to use</h1>

<h2 align="center">1. Install Node.JS</h2>

To install Node.JS, you have to download the installer (choose LTS) from its [homepage](https://nodejs.org/).

When you have downloaded the launcher, click it and let it install.

Once it's installed, you should be able to use Node.JS from the terminal.

For more help on how to install NodeJS, click [me](https://www.pluralsight.com/guides/getting-started-with-nodejs)

<h2 align="center">2. Download the project</h2>

Head over to the [Releases tab](https://github.com/aesthetic0001/2Lazy2Flip/releases/latest) and download the <em>Source code</em> file from <em>Assets</em>.

Extract the downloaded <em>.zip</em> anywhere you like.

<h2 align="center">3. Configure the project</h2>

Head into the extracted folder and open the `config.json` file, JSON stands for `JavaScript Object Notation` and the program will error out if it doesn't follow a set of rules. But you should be fine if you don't change it a lot.

If you want the program to use Discord Webhooks, you have to get a Webhook URL, you can learn how to do it [here](https://help.dashe.io/en/articles/2521940-how-to-create-a-discord-webhook-url).

Once you get the URL, paste it in the `"discordWebhookUrl"` option in the `config.json`

If you don't want it to use Discord, then you have to disable it by setting to `false` the `"useWebhook"` option in the `config.json`

<h2 align="center">4. Start the program</h2>

Open the folder, and type `cmd` in the address bar, this will open a terminal already in the folder.

Now we have to install the dependencies, type `npm install` in the terminal. This should take a while, but it should install all dependencies.

Now you just have to type `npm start` to start the program.
