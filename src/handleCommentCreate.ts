import { SettingsValues, TriggerContext } from "@devvit/public-api";
import { CommentCreate } from "@devvit/protos";
import { AppSetting } from "./settings.js";
import { isLinkId } from "@devvit/shared-types/tid.js";
import { DateTime } from "luxon";
import { ALL_NOTIFICATION_TYPES } from "./actions/allNotificationTypes.js";

function isMonitoredUser (username: string, subredditName: string, settings: SettingsValues): boolean {
    if (settings[AppSetting.NotifyForAutomod] && username === "AutoModerator") {
        return true;
    }

    if (settings[AppSetting.NotifyForModTeamAccount] && username === `${subredditName}-ModTeam`) {
        return true;
    }

    if (settings[AppSetting.NotifyForSpecifiedUsers]) {
        const specifiedUsers = (settings[AppSetting.NotifyForSpecifiedUsers] as string).split(",").map(user => user.trim().toLowerCase());
        if (specifiedUsers.includes(username.toLowerCase())) {
            return true;
        }
    }

    return false;
}

export async function handleCommentCreate (event: CommentCreate, context: TriggerContext) {
    if (!event.comment || !event.author?.name) {
        console.warn("CommentCreate: Missing comment or author information.");
        return;
    }

    if (event.comment.spam) {
        console.log(`CommentCreate: Ignoring filtered or removed comment ${event.comment.id}`);
        return;
    }

    const settings = await context.settings.getAll();
    const subredditName = context.subredditName ?? await context.reddit.getCurrentSubredditName();

    if (isMonitoredUser(event.author.name, subredditName, settings)) {
        await context.redis.set(`comment:${event.comment.id}`, event.author.name, { expiration: DateTime.now().plus({ days: 28 }).toJSDate() });
        return;
    }

    if (isLinkId(event.comment.parentId)) {
        return;
    }

    const parentCommentNotifiableAuthor = await context.redis.get(`comment:${event.comment.parentId}`);
    // Why check the monitored author again? They may no longer be configured to be notified.
    if (!parentCommentNotifiableAuthor || !isMonitoredUser(parentCommentNotifiableAuthor, subredditName, settings)) {
        return;
    }

    const comment = await context.reddit.getCommentById(event.comment.id);

    for (const NotificationHandler of ALL_NOTIFICATION_TYPES) {
        const notificationHandler = new NotificationHandler(settings, context);
        if (!notificationHandler.actionEnabled()) {
            continue;
        }

        await notificationHandler.execute(comment, parentCommentNotifiableAuthor);
        console.log(`CommentCreate: Notified by ${notificationHandler.notificationType} for comment ${event.comment.id}`);
    }
}
