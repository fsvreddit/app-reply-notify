import { Comment, reddit } from "@devvit/web/server";
import { NotifyBase } from "./NotifyBase.js";

export class NotifyByReport extends NotifyBase {
    override notificationType = "Report";
    override enabledByDefault = true;
    override helpText = "Reports the comment when a comment is made in response to a monitored user.";

    override actionSettingsNames = [];

    override async execute (comment: Comment, parentUsername: string): Promise<void> {
        await reddit.report(comment, { reason: `User is replying to ${parentUsername}` });
    }
}
