import { NotifyByReport } from "./NotifyByReport.js";
import { NotifyByDiscord } from "./NotifyByDiscord.js";
import { NotifyByModmail } from "./NotifyByModmail.js";

export const ALL_NOTIFICATION_TYPES = [
    NotifyByReport,
    NotifyByModmail,
    NotifyByDiscord,
];
