import { Comment } from "@devvit/public-api";
import { NotifyBase } from "./NotifyBase.js";
import json2md from "json2md";

export class NotifyByModmail extends NotifyBase {
    override notificationType = "Modmail";
    override enabledByDefault = false;
    override helpText = "Sends a modmail message to the subreddit moderators when a comment is made in response to a monitored user.";

    public actionSettings = [];

    public override async execute (comment: Comment, parentUsername: string): Promise<void> {
        const output: json2md.DataObject[] = [
            { p: `/u/${comment.authorName} has [replied](${comment.permalink}) to a comment by /u/${parentUsername}. Check to see if you need to take action!` },
            { p: "Comment text:" },
            { blockquote: comment.body },
            { p: "*I am a bot, and this action was triggered automatically.*" },
        ];

        await this.context.reddit.modMail.createModInboxConversation({
            subredditId: this.context.subredditId,
            subject: "Comment reply notification",
            bodyMarkdown: json2md(output),
        });
    }
}
