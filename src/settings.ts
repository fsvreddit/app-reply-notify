import { SettingsFormField, TriggerContext } from "@devvit/public-api";
import { ALL_NOTIFICATION_TYPES } from "./actions/allNotificationTypes.js";

export enum AppSetting {
    NotifyForModTeamAccount = "notifyForModTeamAccount",
    NotifyForAutomod = "notifyForAutomod",
    NotifyForSpecifiedUsers = "notifyForSpecifiedUsers",
}

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
                label: "Notify for these specified Users (comma-separated usernames, not case-sensitive)",
                helpText: "Omit the leading /u/ when specifying usernames. For example, to notify for replies to /u/trending-tattler and /u/vip-bot, enter 'trending-tattler, vip-bot'.",
            },
        ],
    },
];

export function getAppSettings (): SettingsFormField[] {
    const settings = [...baseSettings];
    for (const NotificationHandler of ALL_NOTIFICATION_TYPES) {
        const action = new NotificationHandler({}, {} as unknown as TriggerContext);
        settings.push(action.getSettings());
    }

    return settings;
}
