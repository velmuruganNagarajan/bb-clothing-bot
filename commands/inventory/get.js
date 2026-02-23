import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import { getInventory } from '../../services/inventoryService.js';

config();

export default {
    data: new SlashCommandBuilder()
        .setName('inventory-get')
        .setDescription('Get inventory list with pagination')
        .addIntegerOption(option =>
            option
                .setName('page')
                .setDescription('Page number (default: 1)')
                .setMinValue(1)
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('limit')
                .setDescription('Items per page (default: 10)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(false)
        ),
    async execute(interaction) {
        // Check if command is used in the correct channel
        const inventoryChannelId = process.env.INVENTORY_CHANNEL;
        if (inventoryChannelId && interaction.channelId !== inventoryChannelId) {
            return await interaction.reply({
                content: `❌ This command can only be used in the designated inventory channel.`,
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        try {
            const page = interaction.options.getInteger('page') || 1;
            const limit = interaction.options.getInteger('limit') || 20;

            const data = await getInventory(page, limit);
            console.log("------>", data);
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📦 Inventory List')
                .setDescription(`Page ${page} | Limit: ${limit}`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}` });

            if (data.data && Array.isArray(data.data)) {
                if (data.data.length === 0) {
                    embed.setDescription('No inventory items found.');
                } else {
                    const items = data.data.map((item, index) => {
                        const variantId = item.variantId || item.id || 'N/A';
                        const stock = item.stockQuantity || 0;
                        const reserved = item.reservedQuantity || 0;
                        return `ID: ${variantId} - ${item.productVariant.sku} | Stock: ${stock} | Reserved: ${reserved}`;
                    }).join('\n');

                    embed.addFields({
                        name: 'Items',
                        value: items || 'No items to display',
                        inline: false,
                    });

                    if (data.pagination) {
                        embed.addFields(
                            { name: 'Total Pages', value: String(data.pagination.pages || 'N/A'), inline: true },
                            { name: 'Total Items', value: String(data.pagination.total || 'N/A'), inline: true },
                            { name: 'Current Page', value: String(data.pagination.page || 'N/A'), inline: true }
                        );
                    }
                }
            } else {
                embed.setDescription('Inventory data received but format is unexpected.');
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in inventory-get command:', error);
            await interaction.editReply({
                content: `❌ Error fetching inventory: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};
