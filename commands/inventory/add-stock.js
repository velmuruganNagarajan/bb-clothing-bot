import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import { addStock } from '../../services/inventoryService.js';

config();

export default {
    data: new SlashCommandBuilder()
        .setName('inventory-add-stock')
        .setDescription('Add stock to a variant')
        .addIntegerOption(option =>
            option
                .setName('variant-id')
                .setDescription('The variant ID to add stock to')
                .setRequired(true)
                .setMinValue(1)
        )
        .addIntegerOption(option =>
            option
                .setName('quantity')
                .setDescription('Quantity to add')
                .setRequired(true)
                .setMinValue(1)
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
            const quantity = interaction.options.getInteger('quantity');

            const payload = {
                quantity,
            };

            const data = await addStock(variantId, payload);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Stock Added')
                .setDescription(`Successfully added ${quantity} units to variant ${variantId}`)
                .addFields(
                    { name: 'Variant ID', value: String(variantId), inline: true },
                    { name: 'Quantity Added', value: String(quantity), inline: true },
                    { name: 'New Stock Quantity', value: String(data.stockQuantity || 'N/A'), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Updated by ${interaction.user.tag}` });

            if (data.reservedQuantity !== undefined) {
                embed.addFields({ name: 'Reserved Quantity', value: String(data.reservedQuantity), inline: true });
            }

            if (data.availableQuantity !== undefined) {
                embed.addFields({ name: 'Available Quantity', value: String(data.availableQuantity), inline: true });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in inventory-add-stock command:', error);
            await interaction.editReply({
                content: `❌ Error adding stock: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};
