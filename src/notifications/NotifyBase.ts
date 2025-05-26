import { Comment, SettingsFormField, SettingsValues, TriggerContext } from "@devvit/public-api";
import { replaceAll } from "../utility.js";

export abstract class NotifyBase {
    abstract notificationType: string;
    abstract enabledByDefault: boolean;
    abstract actionSettings: SettingsFormField[];
    abstract helpText: string;

    protected context: TriggerContext;
    protected settings: SettingsValues;

    public getSettings (): SettingsFormField {
        const settings: SettingsFormField[] = [...this.actionSettings];
        settings.unshift({
            type: "boolean",
            name: `enable${replaceAll(this.notificationType, " ", "")}Notifications`,
            label: `Enable ${this.notificationType} notifications`,
            defaultValue: this.enabledByDefault,
        });

        return {
            type: "group",
            label: `${this.notificationType} Settings`,
            helpText: this.helpText,
            fields: settings,
        };
    }

    public actionEnabled (): boolean {
        return this.settings[`enable${replaceAll(this.notificationType, " ", "")}Notifications`] as boolean | undefined ?? this.enabledByDefault;
    }

    public constructor (settings: SettingsValues, context: TriggerContext) {
        this.settings = settings;
        this.context = context;
    }

    public abstract execute (comment: Comment, parentUsername: string): Promise<void>;
}
