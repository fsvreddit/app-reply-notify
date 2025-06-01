import { SettingsFormField, TriggerContext } from "@devvit/public-api";
import { ALL_NOTIFICATION_TYPES } from "./notifications/allNotificationTypes.js";

export enum AppSetting {
    NotifyForModTeamAccount = "notifyForModTeamAccount",
    NotifyForAutomod = "notifyForAutomod",
    NotifyForSpecifiedUsers = "notifyForSpecifiedUsers",
    IgnoreCommentsFromModerators = "ignoreCommentsFromModerators",
}

export const SETTINGS_UPDATE_JOB = "settingsUpdateJob";

const baseSettings: SettingsFormField[] = [
    {
        type: "group",
        label: "General Settings",
        fields: [
            {
                type: "boolean",
                name: AppSetting.NotifyForModTeamAccount,
                label: "Notify for replies to subreddit -ModTeam Account",
                defaultValue: true,
            },
            {
                type: "boolean",
                name: AppSetting.NotifyForAutomod,
                label: "Notify for AutoModerator",
                defaultValue: true,
            },
            {
                type: "string",
                name: AppSetting.NotifyForSpecifiedUsers,
                label: "Notify for these specified Users (comma-separated, not case-sensitive)",
                helpText: "Omit the leading /u/ when specifying usernames. For example, to notify for replies to /u/trending-tattler and /u/vip-bot, enter 'trending-tattler, vip-bot'.",
            },
            {
                type: "boolean",
                name: AppSetting.IgnoreCommentsFromModerators,
                label: "Ignore comments from moderators",
                helpText: "If enabled, comments from moderators in reply to the above accounts will not trigger notifications.",
                defaultValue: true,
            },
        ],
    },
];

export function getAppSettings (): SettingsFormField[] {
    const settings = [...baseSettings];
    for (const NotificationHandler of ALL_NOTIFICATION_TYPES) {
        const notificationHandler = new NotificationHandler({}, {} as unknown as TriggerContext);
        settings.push(notificationHandler.getSettings());
    }

    return settings;
}
