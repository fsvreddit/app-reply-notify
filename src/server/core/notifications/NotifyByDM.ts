import { Comment, reddit } from "@devvit/web/server";
import { NotifyBase } from "./NotifyBase.js";

export class NotifyByDM extends NotifyBase {
    override notificationType = "Direct Message";
    override enabledByDefault = false;
    override helpText = "Sends a direct message to the user when a comment is made in response to a monitored user, if the user has DMs enabled.";

    private messageSubjectSetting = "directMessageSubject";
    private messageTemplateSetting = "directMessageTemplate";
    override actionSettingsNames: string[] = [
        this.messageSubjectSetting,
        this.messageTemplateSetting,
    ];

    public override async execute (comment: Comment, parentUsername: string): Promise<void> {
        let message = this.settings[this.messageTemplateSetting] as string | undefined;
        if (!message) {
            console.warn("Direct message template is not set. Skipping DM notification.");
            return;
        }

        let messageSubject = this.settings[this.messageSubjectSetting] as string | undefined ?? "";
        if (messageSubject.trim() === "") {
            messageSubject = "Comment reply notification";
        }

        message = message.replaceAll("{{authorname}}", comment.authorName);
        message = message.replaceAll("{{permalink}}", comment.permalink);
        message = message.replaceAll("{{parentusername}}", parentUsername);

        await reddit.sendPrivateMessage({
            to: comment.authorName,
            subject: messageSubject,
            text: message,
        });
    }
}
