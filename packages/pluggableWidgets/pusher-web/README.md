# Pusher

Listen to Notify server action and perform client side action

## Overview

- **Folder**: `pusher-web`
- **Category**: Uncategorized
- **Offline capable**: No
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/pusher)

## XML Properties

- **Object to listen** (`objectSource`; type: datasource).
- **Event Handlers** (`eventHandlers`; type: object, optional, list). Configure multiple event handlers for different Pusher events
- **Action name** (`actionName`; type: string, required). The name should match the 'Notify' action parameter `ActionName`
- **Action** (`action`; type: action, optional). Client action to execute when this event is received
