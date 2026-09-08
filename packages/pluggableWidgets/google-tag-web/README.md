# Google Tag Command

Google tag integration widget

## Overview

- **Folder**: `google-tag-web`
- **Category**: Uncategorized
- **Offline capable**: Yes

## XML Properties

- **Widget mode** (`widgetMode`; type: enumeration, default: basic). The basic option automatically sends page view events. Place this widget in the layouts to automatically send events when pages are changed. The advanced option can be used for more control. Allowed values: `basic` (Basic), `advanced` (Advanced).
- **Tag ID** (`targetId`; type: expression, optional). Examples of tag IDs include GT-XXXXXXXXX, G-XXXXXXXXX, and AW-XXXXXXXXX Returns: String.
- **Parameters** (`parameters`; type: object, optional, list).
- **Name** (`name`; type: string, required).
- **Value** (`valueType`; type: enumeration, default: predefined). Allowed values: `predefined` (Predefined), `custom` (Custom).
- **Standard value** (`predefinedValue`; type: enumeration, default: pageName). Allowed values: `pageTitle` (Page Title), `pageUrl` (Page URL), `pageName` (Page Name), `moduleName` (Module Name), `pageAndModuleName` (Page and Module Name), `sessionId` (Session ID), `userLocale` (User Locale).
- **Custom value** (`customValue`; type: expression, optional). Returns: String.
- **Share user ID** (`sendUserID`; type: boolean, required, default: false). Expose the authenticated User ID to uniquely identify individual users in Google Analytics.
- **Command** (`command`; type: enumeration, required, default: event). Event can be used to send an event. Config can be used to configure advanced configuration parameters. Allowed values: `event` (Event), `config` (Config).
- **Event name** (`eventName`; type: string, optional).
- **Track page changes** (`trackPageChanges`; type: boolean, required, default: false). Send the event when the page is changed.
