import { context, reddit, redis, settings, SettingsValues } from "@devvit/web/server";
import { isT3, OnCommentCreateRequest, T1, TriggerResponse } from "@devvit/web/shared";
import { fixCommentTriggerEvent, hasEventBeenHandled, isModerator } from "@fsvreddit/fsv-devvit-web-helpers";
import { Context } from "hono";
import { ALL_NOTIFICATION_TYPES, AppSetting } from "../core";
import { addDays } from "date-fns";

async function getCommentAuthor (commentId: T1): Promise<string> {
    const commentAuthor = await redis.get(`comment:${commentId}`);
    if (commentAuthor) {
        return commentAuthor;
    }

    const comment = await reddit.getCommentById(commentId);
    return comment.authorName;
}

function isMonitoredUser (username: string, settings: SettingsValues): boolean {
    if (settings[AppSetting.NotifyForAutomod] && username === "AutoModerator") {
        return true;
    }

    if (settings[AppSetting.NotifyForModTeamAccount] && username === `${context.subredditName}-ModTeam`) {
        return true;
    }

    if (settings[AppSetting.NotifyForAutomodNeo] && username === "automod-neo") {
        return true;
    }

    const specifiedUsersVal = settings[AppSetting.NotifyForSpecifiedUsers] as string | undefined;
    if (specifiedUsersVal) {
        const specifiedUsers = new Set(specifiedUsersVal.split(",").map(user => user.trim().toLowerCase()));
        if (specifiedUsers.has(username.toLowerCase())) {
            return true;
        }
    }

    return false;
}

export const onCommentCreate = async (c: Context): Promise<Response> => {
    const event = await fixCommentTriggerEvent(await c.req.json<OnCommentCreateRequest>());

    const authorName = event.author?.name;

    if (!authorName) {
        console.error("CommentCreate: Missing author information.");
        return c.json<TriggerResponse>({ message: "Missing author information." }, 200);
    }

    if (!event.comment) {
        console.error("CommentCreate: Missing comment information.");
        return c.json<TriggerResponse>({ message: "Missing comment information." }, 200);
    }

    await redis.set(`comment:${event.comment.id}`, authorName, { expiration: addDays(new Date(), 1) });

    if (event.comment.spam) {
        return c.json<TriggerResponse>({ message: "Comment is spam." }, 200);
    }

    if (isT3(event.comment.parentId)) {
        return c.json<TriggerResponse>({ message: "Parent is a link." }, 200);
    }

    if (await hasEventBeenHandled(`commentCreate:${event.comment.id}`)) {
        console.log(`CommentCreate: Trigger already handled for comment ${event.comment.id}. Skipping.`);
        return c.json<TriggerResponse>({ message: "Event already handled." }, 200);
    }

    const appSettings = await settings.getAll();

    const parentAuthor = await getCommentAuthor(event.comment.parentId as T1);
    if (!isMonitoredUser(parentAuthor, appSettings)) {
        return c.json<TriggerResponse>({ message: "Parent author not monitored." }, 200);
    }

    const ignoreMods = appSettings[AppSetting.IgnoreCommentsFromModerators] as boolean | undefined ?? true;
    if (ignoreMods && await isModerator(context.subredditName, authorName)) {
        console.log(`CommentCreate: Ignoring comment from moderator ${authorName} in response to ${parentAuthor}`);
        return c.json<TriggerResponse>({ message: "Comment from moderator ignored." }, 200);
    }

    const comment = await reddit.getCommentById(event.comment.id as T1);

    for (const NotificationHandler of ALL_NOTIFICATION_TYPES) {
        const notificationHandler = new NotificationHandler(appSettings);
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

    return c.json<TriggerResponse>({ message: "Comment processed." }, 200);
};
