# Discord Bot Project

A modern Discord bot built with Discord.js v14, featuring slash commands, event handlers, and a clean project structure.

## Features

- 🎯 Slash commands support
- 📁 Organized command and event structure
- 🔧 Easy to extend and customize
- 🚀 Modern ES6+ JavaScript with modules
- ⚡ Hot reload support for development

## Prerequisites

- Node.js 18.0.0 or higher
- A Discord bot token (get one from [Discord Developer Portal](https://discord.com/developers/applications))

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Fill in your `.env` file:**
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here (optional, for testing)
   ```

4. **Deploy slash commands:**
   ```bash
   node deploy-commands.js
   ```

5. **Start the bot:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Project Structure

```
.
├── commands/          # Slash command files
│   ├── ping.js
│   └── info.js
├── events/           # Event handler files
│   ├── ready.js
│   └── interactionCreate.js
├── index.js          # Main bot file
├── deploy-commands.js # Command deployment script
├── config.js         # Configuration file
├── package.json
└── README.md
```

## Creating New Commands

1. Create a new file in the `commands/` directory
2. Export a default object with `data` and `execute` properties:

```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('Command description'),
  async execute(interaction) {
    await interaction.reply('Hello!');
  },
};
```

3. Run `node deploy-commands.js` to deploy the new command

## Creating New Events

1. Create a new file in the `events/` directory
2. Export a default object with `name`, `once` (optional), and `execute`:

```javascript
import { Events } from 'discord.js';

export default {
  name: Events.MessageCreate,
  execute(message) {
    // Your event logic here
  },
};
```

## Getting Your Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Click "Add Bot"
5. Copy the token and paste it in your `.env` file
6. Enable the following intents in the Bot section:
   - Server Members Intent
   - Message Content Intent

## Inviting Your Bot

1. Go to the "OAuth2" > "URL Generator" section
2. Select scopes: `bot` and `applications.commands`
3. Select bot permissions as needed
4. Copy the generated URL and open it in your browser to invite the bot

## License

MIT
