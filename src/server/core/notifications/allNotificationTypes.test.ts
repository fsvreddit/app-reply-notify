import { ALL_NOTIFICATION_TYPES } from "./allNotificationTypes.js";

test("All notification handlers have unique names", () => {
    const notificationActionNames = new Set<string>();
    for (const NotificationHandler of ALL_NOTIFICATION_TYPES) {
        const notificationHandler = new NotificationHandler({});
        if (notificationActionNames.has(notificationHandler.notificationType)) {
            assert.fail(`Duplicate notification handler name found: ${notificationHandler.notificationType}`);
        }
        notificationActionNames.add(notificationHandler.notificationType);
    }
});
