import { SettingsValues, TriggerContext } from "@devvit/public-api";
import { CommentCreate } from "@devvit/protos";
import { AppSetting } from "./settings.js";
import { isLinkId } from "@devvit/shared-types/tid.js";
import { DateTime } from "luxon";
import { ALL_NOTIFICATION_TYPES } from "./notifications/allNotificationTypes.js";

async function getCommentAuthor (commentId: string, context: TriggerContext): Promise<string> {
    const commentAuthor = await context.redis.get(`comment:${commentId}`);
    if (commentAuthor) {
        return commentAuthor;
    }

    const comment = await context.reddit.getCommentById(commentId);
    return comment.authorName;
}

function isMonitoredUser (username: string, subredditName: string, settings: SettingsValues): boolean {
    if (settings[AppSetting.NotifyForAutomod] && username === "AutoModerator") {
        return true;
    }

    if (settings[AppSetting.NotifyForModTeamAccount] && username === `${subredditName}-ModTeam`) {
        return true;
    }

    const specifiedUsersVal = settings[AppSetting.NotifyForSpecifiedUsers] as string | undefined;
    if (specifiedUsersVal) {
        const specifiedUsers = specifiedUsersVal.split(",").map(user => user.trim().toLowerCase());
        if (specifiedUsers.includes(username.toLowerCase())) {
            return true;
        }
    }

    return false;
}

export async function handleCommentCreate (event: CommentCreate, context: TriggerContext) {
    if (!event.comment || !event.author?.name) {
        console.error("CommentCreate: Missing comment or author information.");
        return;
    }

    await context.redis.set(`comment:${event.comment.id}`, event.author.name, { expiration: DateTime.now().plus({ days: 1 }).toJSDate() });

    if (event.comment.spam) {
        return;
    }

    if (isLinkId(event.comment.parentId)) {
        return;
    }

    const settings = await context.settings.getAll();
    const subredditName = context.subredditName ?? await context.reddit.getCurrentSubredditName();

    const parentAuthor = await getCommentAuthor(event.comment.parentId, context);
    if (!isMonitoredUser(parentAuthor, subredditName, settings)) {
        return;
    }

    const comment = await context.reddit.getCommentById(event.comment.id);

    for (const NotificationHandler of ALL_NOTIFICATION_TYPES) {
        const notificationHandler = new NotificationHandler(settings, context);
        if (!notificationHandler.actionEnabled()) {
            continue;
        }

        try {
            await notificationHandler.execute(comment, parentAuthor);
            console.log(`CommentCreate: Notified by ${notificationHandler.notificationType} for comment ${event.comment.id}`);
        } catch (error) {
            console.error(`CommentCreate: Error notifying by ${notificationHandler.notificationType} for comment ${event.comment.id}`, error);
        }
    }
}
