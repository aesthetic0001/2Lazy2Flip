<h1 align="center">How to use</h1>

<h2 align="center">1. Install Node.JS</h2>

To install Node.JS, you have to download the installer (choose LTS) from its [homepage](https://nodejs.org/).

When you have downloaded the launcher, click it and let it install.

Once it's installed, you should be able to use Node.JS from the terminal.

For more help on how to install NodeJS, click [me](https://www.pluralsight.com/guides/getting-started-with-nodejs)

<h2 align="center">2. Download the project</h2>

Head over to the [Releases tab](https://github.com/aesthetic0001/2Lazy2Flip/releases/latest) and download the <em>Source code</em> file from <em>Assets</em>.

<img width="1517" alt="latestTab" src="https://user-images.githubusercontent.com/15858616/144899052-f4044eb2-f7cc-4c1b-9cc1-f11a4d367b24.png">

Extract the downloaded <em>.zip</em> anywhere you like.

For more info on how to extract .zip files, click [me (Windows)](https://www.cedarville.edu/insights/computer-help/post/how-to-extract-files-from-a-zipped-compressed-folder) or [me (MacOS)](https://www.businessinsider.com/how-to-unzip-files-on-mac#:~:text=To%20unzip%20zipped%20files%20on,zipped%20folder%20on%20your%20desktop.)

<h2 align="center">3. Configuring the project</h2>

Head into the extracted folder and open the `config.json` file, JSON stands for `JavaScript Object Notation`.

Here are some simple rules to follow when configuring the project:

JSON looks something like "key": value

When configuring the JSON file, do <b>NOT</b> change the key. <b>Only change the value<\b>

When changing a value, do not add or remove the quotation marks (""). If there is one, then write the value INSIDE the quotations.

If the value is a true/false, change it to only true or false WITHOUT quotation marks

If the value is a number without any quotation marks, DO NOT ADD THEM!!!

Do not remove the commas after each value!

If you follow these rules, you should be fine. 

For example, if you want the program to use Discord Webhooks, you have to get a Webhook URL, you can learn how to do it [here](https://help.dashe.io/en/articles/2521940-how-to-create-a-discord-webhook-url).

Once you get the URL, paste it in the `"discordWebhookUrl"` option in `config.json`

If you don't want it to use a Discord Webhook, then you have to disable it by setting to `false` the `"useWebhook"` option in the `config.json`

<h2 align="center">4. Start the program</h2>

Windows:

Open the folder, and type `cmd` in the address bar, this will open a terminal already in the folder.

Now we have to install the dependencies, type `npm install` in the terminal. This should take a while, but it should install all dependencies.

Now you just have to type `npm start` to start the program.

Mac:

TODO
