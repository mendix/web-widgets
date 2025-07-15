# Calendar module

This module bundles the **Calendar** pluggable widget together with sample pages, domain model, and helper flows so that app builders can drag-and-drop a fully working calendar including _New Event_ and _Edit Event_ dialogs.

## Contents

- Calendar widget (`@mendix/calendar-web`)
- Pages: `Calendar_Overview`, `Calendar_NewEvent`, `Calendar_EditEvent`
- Microflows for creating, editing and persisting events
- Domain model for `Event` entity

## Usage

1. Import the module `.mpk` file into your Mendix project.
2. Drag the _Calendar_Overview_ page into your navigation or use the _Calendar_ page layout.
3. Customize the microflows or replace the `Event` entity with your own via associations.

For full documentation of widget properties see the [Calendar widget docs](https://docs.mendix.com/appstore/widgets/calendar).
