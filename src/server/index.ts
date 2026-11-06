import { Hono } from "hono";
import { createServer, getServerPort } from "@devvit/web/server";
import { getRequestListener } from "@hono/node-server";
import { onCommentCreate } from "./triggers";
import { handleValidateWebhook } from "./validators";

const application = new Hono();

// Triggers
application.post("/internal/triggers/comment-create", onCommentCreate);

// Settings validators
application.post("/internal/validators/discord-webhook", handleValidateWebhook);

const server = createServer(getRequestListener(application.fetch));
server.on("error", (err) => {
    console.error(`server error; ${err.stack}`);
});

const port = getServerPort();
server.listen(port);
