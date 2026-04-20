import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import { updateInventory } from '../../services/inventoryService.js';

config();

export default {
    data: new SlashCommandBuilder()
        .setName('inventory-update')
        .setDescription('Update inventory for a variant')
        .addIntegerOption(option =>
            option
                .setName('variant-id')
                .setDescription('The variant ID to update')
                .setRequired(true)
                .setMinValue(1)
        )
        .addIntegerOption(option =>
            option
                .setName('stock-quantity')
                .setDescription('New stock quantity')
                .setRequired(false)
                .setMinValue(0)
        )
        .addIntegerOption(option =>
            option
                .setName('reserved-quantity')
                .setDescription('New reserved quantity')
                .setRequired(false)
                .setMinValue(0)
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
            const variantId = interaction.options.getInteger('variant-id');
            const stockQuantity = interaction.options.getInteger('stock-quantity');
            const reservedQuantity = interaction.options.getInteger('reserved-quantity');

            if (stockQuantity === null && reservedQuantity === null) {
                return await interaction.editReply({
                    content: `❌ Please provide either stock quantity or reserved quantity.`,
                });
            }

            const payload = {};
            if (stockQuantity !== null) payload.stockQuantity = stockQuantity;
            if (reservedQuantity !== null) payload.reservedQuantity = reservedQuantity;

            const data = await updateInventory(variantId, payload);
            console.log("------>", data);
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Inventory Updated')
                .setDescription(`Successfully updated inventory for variant ${variantId}`)
                .addFields(
                    { name: 'Variant ID', value: String(variantId), inline: true },
                    { name: 'Stock Quantity', value: String(data.stockQuantity || stockQuantity), inline: true },
                    { name: 'Reserved Quantity', value: String(data.reservedQuantity || reservedQuantity), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Updated by ${interaction.user.tag}` });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in inventory-update command:', error);
            await interaction.editReply({
                content: `❌ Error updating inventory: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};
