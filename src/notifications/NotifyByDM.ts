import { Comment, SettingsFormField } from "@devvit/public-api";
import { NotifyBase } from "./NotifyBase.js";
import { replaceAll } from "../utility.js";

export class NotifyByDM extends NotifyBase {
    override notificationType = "Direct Message";
    override enabledByDefault = false;
    override helpText = "Sends a direct message to the user when a comment is made in response to a monitored user, if the user has DMs enabled.";

    private messageSubjectSetting = "directMessageSubject";
    private messageTemplateSetting = "directMessageTemplate";
    override actionSettings: SettingsFormField[] = [
        {
            type: "string",
            name: this.messageSubjectSetting,
            label: "Subject for the direct message sent to the user",
            defaultValue: "Comment reply notification",
        },
        {
            type: "paragraph",
            name: this.messageTemplateSetting,
            label: "Template for the direct message sent to the user",
            helpText: "You can use the following placeholders: {{authorname}}, {{permalink}}, {{parentusername}}.",
        },
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

        message = replaceAll(message, "{{authorname}}", comment.authorName);
        message = replaceAll(message, "{{permalink}}", comment.permalink);
        message = replaceAll(message, "{{parentusername}}", parentUsername);

        await this.context.reddit.sendPrivateMessage({
            to: comment.authorName,
            subject: messageSubject,
            text: message,
        });
    }
}
