import { Comment, SettingsFormField } from "@devvit/public-api";
import { NotifyBase } from "./NotifyBase.js";
import { EmbedBuilder } from "discord.js";

export class NotifyByDiscord extends NotifyBase {
    override notificationType = "Discord";
    override enabledByDefault = false;

    private webhookSetting = "discordWebhookUrl";
    override actionSettings: SettingsFormField[] = [
        {
            type: "string",
            name: this.webhookSetting,
            label: "Discord Webhook URL",
            onValidate: ({ value }) => {
                if (!value) {
                    return;
                }

                const webhookRegex = /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/;

                if (!webhookRegex.test(value)) {
                    return "Please enter a valid Discord webhook URL, or leave blank to not send Discord notifications.";
                }
            },
        },
    ];

    override async execute (comment: Comment, parentUsername: string): Promise<void> {
        const webhookURL = this.settings[this.webhookSetting] as string | undefined;
        if (!webhookURL) {
            console.warn(`Discord webhook URL is not set. Skipping Discord notification for ${comment.id}.`);
            return;
        }

        const embed = new EmbedBuilder();
        embed.setTitle(`Reply notification from /u/${comment.authorName} to a comment by /u/${parentUsername}`);
        embed.setDescription(comment.body);
        embed.setURL(`https://www.reddit.com${comment.permalink}`);

        const params = {
            username: "App Reply Notifier",
            embeds: [embed.toJSON()],
        };

        await fetch(
            webhookURL,
            {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            },
        );
    }
}
