import { TriggerContext } from "@devvit/public-api";
import { ALL_NOTIFICATION_TYPES } from "./allNotificationTypes.js";

test("All notification handlers have unique names", () => {
    const notificationActionNames = new Set<string>();
    for (const NotificationHandler of ALL_NOTIFICATION_TYPES) {
        const notificationHandler = new NotificationHandler({}, {} as unknown as TriggerContext);
        if (notificationActionNames.has(notificationHandler.notificationType)) {
            assert.fail(`Duplicate notification handler name found: ${notificationHandler.notificationType}`);
        }
        notificationActionNames.add(notificationHandler.notificationType);
    }
});

test("All settings fields have unique names and no nested groups", () => {
    const fieldNames = new Set<string>();
    for (const NotificationHandler of ALL_NOTIFICATION_TYPES) {
        const notificationHandler = new NotificationHandler({}, {} as unknown as TriggerContext);
        const settings = notificationHandler.getSettings();
        if (settings.type !== "group") {
            assert.fail(`Expected settings to be a group, got ${settings.type}`);
        }

        for (const field of settings.fields) {
            if (field.type === "group") {
                assert.fail(`Expected settings fields on ${notificationHandler.notificationType} to not contain nested groups`);
            }
            if (fieldNames.has(field.name)) {
                assert.fail(`Duplicate field name found: ${field.name} in action ${notificationHandler.notificationType}`);
            }
            fieldNames.add(field.name);
        }
    }
});
