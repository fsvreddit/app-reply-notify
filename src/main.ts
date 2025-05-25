import { Devvit } from "@devvit/public-api";
import { getAppSettings } from "./settings.js";
import { handleCommentCreate } from "./handleCommentCreate.js";

Devvit.addSettings(getAppSettings());

Devvit.addTrigger({
    event: "CommentCreate",
    onEvent: handleCommentCreate,
});

Devvit.configure({
    redditAPI: true,
    http: true,
});

export default Devvit;
