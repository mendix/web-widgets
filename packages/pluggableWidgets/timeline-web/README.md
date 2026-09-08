# Timeline

Shows vertical timeline with events

## Overview

- **Folder**: `timeline-web`
- **Category**: Display
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/timeline)

## XML Properties

### Data source

- **Data source** (`data`; type: datasource, list).
- **Title** (`title`; type: textTemplate, optional, data source: data).
- **Description** (`description`; type: textTemplate, optional, data source: data).
- **Time Indication** (`timeIndication`; type: textTemplate, optional, data source: data).

### General

- **Custom Visualization** (`customVisualization`; type: boolean, default: false). Enables free to model timeline.
- **Icon** (`icon`; type: icon, optional). If no icon is configured, a circle will be rendered.
- **Group Events** (`groupEvents`; type: boolean, default: true). Shows a header between grouped events based on event date.
- **Group Attribute** (`groupAttribute`; type: attribute, optional, data source: data). Will be used for grouping events, as a group header value. If events have no date time value, use "Unscheduled events placement" to control rendering. Attribute types: DateTime.
- **Group by** (`groupByKey`; type: enumeration, default: day). Group events based on day, month or year. Allowed values: `day` (Day), `month` (Month), `year` (Year).
- **Format** (`groupByDayOptions`; type: enumeration, default: dayName). Format group header with current language's format Allowed values: `dayName` (Day name), `dayMonth` (Day and month), `fullDate` (Day, month, year).
- **Format** (`groupByMonthOptions`; type: enumeration, default: month). Allowed values: `month` (Month), `monthYear` (Month and year).
- **Ungrouped events position** (`ungroupedEventsPosition`; type: enumeration, default: end). Position in the list of events without a date and time Allowed values: `beginning` (Beginning of the timeline), `end` (End of the timeline).

### Custom

- **Icon** (`customIcon`; type: widgets, optional, data source: data). Content of the icon
- **Group header** (`customGroupHeader`; type: widgets, optional, data source: data). Content of the group header
- **Title** (`customTitle`; type: widgets, optional, data source: data). Content of the title
- **Event time** (`customEventDateTime`; type: widgets, optional, data source: data). Content of the event time
- **Content** (`customDescription`; type: widgets, optional, data source: data). Content of the description

- **On click** (`onClick`; type: action, optional, data source: data).
