import { Comment } from "@devvit/web/server";
import { NotifyBase } from "./NotifyBase.js";

export class NotifyByDiscord extends NotifyBase {
    override notificationType = "Discord";
    override enabledByDefault = false;
    override helpText = "Sends a Discord notification when a comment is made in response to a monitored user.";

    private webhookSetting = "discordWebhookUrl";
    override actionSettingsNames: string[] = [
        this.webhookSetting,
    ];

    override async execute (comment: Comment, parentUsername: string): Promise<void> {
        const webhookURL = this.settings[this.webhookSetting] as string | undefined;
        if (!webhookURL) {
            console.warn(`Discord webhook URL is not set. Skipping Discord notification for ${comment.id}.`);
            return;
        }

        const params = {
            username: "App Reply Notifier",
            embeds: [
                {
                    title: `/u/${comment.authorName} replied to a comment by /u/${parentUsername}`,
                    description: comment.body,
                    url: `https://www.reddit.com${comment.permalink}`,
                },
            ],
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
