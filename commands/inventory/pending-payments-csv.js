import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { config } from 'dotenv';
import { getPendingPaymentsReport } from '../../services/reportService.js';

config();

function escapeCsvValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
}

function rowsToCsv(rows) {
    if (!rows || rows.length === 0) {
        return 'message\n"No pending payment orders found."';
    }

    const headers = Object.keys(rows[0]);
    const headerLine = headers.map(escapeCsvValue).join(',');
    const rowLines = rows.map((row) =>
        headers.map((header) => escapeCsvValue(row[header])).join(',')
    );

    return [headerLine, ...rowLines].join('\n');
}

export default {
    data: new SlashCommandBuilder()
        .setName('inventory-pending-payments-csv')
        .setDescription('Export pending payment orders report as CSV'),
    async execute(interaction) {
        const userStatsChannelId = process.env.USER_STATS_CHANNEL;
        if (userStatsChannelId && interaction.channelId !== userStatsChannelId) {
            return await interaction.reply({
                content: '❌ This command can only be used in the designated user stats channel.',
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        try {
            const rows = await getPendingPaymentsReport();
            const csvContent = rowsToCsv(rows);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `pending-order-payments-${timestamp}.csv`;
            const csvAttachment = new AttachmentBuilder(Buffer.from(csvContent, 'utf8'), {
                name: fileName,
            });

            await interaction.editReply({
                content: `✅ Report generated with ${rows.length} row(s).`,
                files: [csvAttachment],
            });
        } catch (error) {
            console.error('Error in inventory-pending-payments-csv command:', error);
            await interaction.editReply({
                content: `❌ Error generating CSV report: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};
