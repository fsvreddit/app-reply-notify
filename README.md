This app notifies you if a reply is made to AutoModerator, the subreddit -ModTeam user, or any other users you configure to be monitored.

Mods don't have easy visiblity when a user replies to a bot, Dev Platform app account, Automod or the -ModTeam user. Often, there may be something that needs to be actioned.

By default, report notifications are switched on for the -ModTeam and Automod. You can configure additional accounts (e.g. if you have Dev Platform apps or other bots on your subreddit).

## Notification Options

There are a number of different ways you can choose to be notified. You can choose one or more methods to alert the mod team with.

Note: Notifications will not be sent for comments that were filtered to the modqueue or immediately removed by Automoderator or Reddit's filters.

### Report

This creates a report on the user comment:

![image](https://github.com/fsvreddit/app-reply-notify/blob/main/doc_images/report.png?raw=true)

### Modmail

This sends a modmail to the subreddit with a link to the comment and its contents:

![image](https://github.com/fsvreddit/app-reply-notify/blob/main/doc_images/modmail.png?raw=true)

### Discord

This sends a notification to a configured Discord webhook:

![image](https://github.com/fsvreddit/app-reply-notify/blob/main/doc_images/discord.png?raw=true)

The title of the embed is a link to the comment being reported.

### Direct Message

This sends a message to the user (if they have DMs enabled) based on the message configured in settings. Placeholders {{authorname}}, {{permalink}} and {{parentusername}} are supported.

This could be useful if you just want to notify the user that their message won't be noticed and that if they have a query, they should contact Modmail.

## Change Log

### v1.1.0

Add option (enabled by default) to ignore comments made by moderators

### v1.0.2

Initial release

## About this app

App Reply Notifier is open source. You can find the source code [here](https://github.com/fsvreddit/app-reply-notify).
