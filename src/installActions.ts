import { TriggerContext } from "@devvit/public-api";
import { AppInstall } from "@devvit/protos";
import { DateTime } from "luxon";

/**
 * On install, store the latest 100 comments from the subreddit -ModTeam account in Redis.
 */
export async function handleAppInstall (_: AppInstall, context: TriggerContext) {
    const subredditName = context.subredditName ?? await context.reddit.getCurrentSubredditName();

    const comments = await context.reddit.getCommentsByUser({
        username: `${subredditName}-ModTeam`,
        limit: 100,
        sort: "new",
    }).all();

    await Promise.all(comments.map(comment => context.redis.set(`comment:${comment.id}`, comment.authorName, { expiration: DateTime.now().plus({ days: 28 }).toJSDate() })));
}
