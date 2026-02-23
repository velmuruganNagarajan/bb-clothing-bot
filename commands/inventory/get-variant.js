import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import { getInventoryByVariant } from '../../services/inventoryService.js';

config();

export default {
    data: new SlashCommandBuilder()
        .setName('inventory-get-variant')
        .setDescription('Get inventory details for a specific variant')
        .addIntegerOption(option =>
            option
                .setName('variant-id')
                .setDescription('The variant ID to get inventory for')
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

            const data = await getInventoryByVariant(variantId);
            console.log("------>", data);
            console.log("------>", data.stockQuantity);
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`📦 Inventory - Variant ${variantId}`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}` });

            if (data) {
                embed.addFields(
                    { name: 'Variant ID', value: String(data.id || data.productVariantId), inline: true },
                    { name: 'Stock Quantity', value: String(data.stockQuantity || 0), inline: true },
                    { name: 'Reserved Quantity', value: String(data.reservedQuantity || 0), inline: true }
                );

                if (data.availableQuantity !== undefined) {
                    embed.addFields({ name: 'Available Quantity', value: String(data.availableQuantity), inline: true });
                }

                if (data.productName || data.variantName) {
                    embed.addFields({
                        name: 'Product/Variant',
                        value: data.productName || data.variantName || 'N/A',
                        inline: false
                    });
                }
            } else {
                embed.setDescription('No inventory data found for this variant.');
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in inventory-get-variant command:', error);
            await interaction.editReply({
                content: `❌ Error fetching inventory for variant: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};
