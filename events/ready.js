import { Events, ActivityType } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);
    console.log(`👥 Serving ${client.users.cache.size} user(s)`);
    
    // Set bot activity
    client.user.setActivity('with Discord.js', { type: ActivityType.Playing });
  },
};
