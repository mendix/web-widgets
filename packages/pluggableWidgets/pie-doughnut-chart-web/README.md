# Pie chart

Renders a pie or doughnut chart

## Overview

- **Folder**: `pie-doughnut-chart-web`
- **Category**: Charts
- **Offline capable**: Yes

## XML Properties

### Data source

- **Series** (`seriesDataSource`; type: datasource, required, list).
- **Series name** (`seriesName`; type: textTemplate, required, data source: seriesDataSource).
- **Value attribute** (`seriesValueAttribute`; type: attribute, required, data source: seriesDataSource). Attribute types: Decimal, Integer, Long.
- **Sort attribute** (`seriesSortAttribute`; type: attribute, optional, data source: seriesDataSource). Attribute types: String, Boolean, DateTime, Decimal, Enum, HashString, Integer, Long.
- **Sort order** (`seriesSortOrder`; type: enumeration, default: asc). Allowed values: `asc` (Ascending), `desc` (Descending).
- **Slice color** (`seriesColorAttribute`; type: expression, optional, data source: seriesDataSource). Returns: String.
- **Selection type** (`seriesItemSelection`; type: selection, data source: seriesDataSource).

### General

- **Enable advanced options** (`enableAdvancedOptions`; type: boolean, default: false).
- **Show playground slot** (`showPlaygroundSlot`; type: boolean, default: false).
- **Playground slot** (`playground`; type: widgets, optional).
- **Show legend** (`showLegend`; type: boolean, default: true).
- **Hole radius** (`holeRadius`; type: integer, default: 0). A percentage between 0 and 100 indicating the radius of the hole in the pie chart relative to the chart itself. Defaults to 0.
- **Tooltip hover text** (`tooltipHoverText`; type: textTemplate, optional, data source: seriesDataSource).

### Visibility

- **Visibility**. Standard Mendix system property.

### Common

- **Name**. Standard Mendix system property.
- **TabIndex**. Standard Mendix system property.

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: percentage). Percentage: portion of parent size. Pixels: absolute amount of pixels. Allowed values: `percentage` (Percentage), `pixels` (Pixels).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: percentageOfWidth). Allowed values: `percentageOfWidth` (Percentage of width), `pixels` (Pixels), `percentageOfParent` (Percentage of parent).
- **Height** (`height`; type: integer, default: 75).

### Events

- **On click action** (`onClickAction`; type: action, optional, data source: seriesDataSource).

### Advanced

- **Enable theme folder config loading** (`enableThemeConfig`; type: boolean, default: false).
- **Custom layout** (`customLayout`; type: string, optional).
- **Custom configurations** (`customConfigurations`; type: string, optional).
- **Custom series options** (`customSeriesOptions`; type: string, optional).
