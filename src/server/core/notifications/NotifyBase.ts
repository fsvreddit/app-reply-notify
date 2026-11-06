import { Comment, SettingsValues } from "@devvit/web/server";

export abstract class NotifyBase {
    abstract notificationType: string;
    abstract enabledByDefault: boolean;
    abstract actionSettingsNames: string[];
    abstract helpText: string;

    protected settings: SettingsValues;

    public getSettingsNames (): string[] {
        return [
            `enable${this.notificationType.replaceAll(" ", "")}Notifications`,
            ...this.actionSettingsNames,
        ];
    }

    public actionEnabled (): boolean {
        return this.settings[`enable${this.notificationType.replaceAll(" ", "")}Notifications`] as boolean | undefined ?? this.enabledByDefault;
    }

    public constructor (settings: SettingsValues) {
        this.settings = settings;
    }

    public abstract execute (comment: Comment, parentUsername: string): Promise<void>;
}
