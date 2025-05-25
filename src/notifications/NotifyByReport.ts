import { Comment } from "@devvit/public-api";
import { NotifyBase } from "./NotifyBase.js";

export class NotifyByReport extends NotifyBase {
    override notificationType = "Report";
    override enabledByDefault = true;

    override actionSettings = [];

    override async execute (comment: Comment, parentUsername: string): Promise<void> {
        await this.context.reddit.report(comment, { reason: `User is replying to ${parentUsername}` });
    }
}
