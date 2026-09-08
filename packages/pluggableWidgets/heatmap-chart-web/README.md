# Heat map

Renders a heatmap chart

## Overview

- **Folder**: `heatmap-chart-web`
- **Category**: Charts
- **Offline capable**: Yes

## XML Properties

### Data source

- **Series** (`seriesDataSource`; type: datasource, required, list).
- **Value attribute** (`seriesValueAttribute`; type: attribute, required, data source: seriesDataSource). The attribute used to display “heat” at an “x y” location. Attribute types: Decimal, Integer, Long.
- **Selection type** (`seriesItemSelection`; type: selection, data source: seriesDataSource).

### Axis

- **X Axis Attribute** (`horizontalAxisAttribute`; type: attribute, optional, data source: seriesDataSource). Attribute types: String, Enum.
- **X Axis Sort Attribute** (`horizontalSortAttribute`; type: attribute, optional, data source: seriesDataSource). Attribute to use for sorting the data. Sorting can only be used when data source is ‘Database’. For data source ‘Microflow’, the sorting should be done within the microflow. Attribute types: Decimal, Long, Integer, String, AutoNumber, DateTime.
- **X Axis Sort Order** (`horizontalSortOrder`; type: enumeration, default: asc). Allowed values: `asc` (Ascending), `desc` (Descending).
- **Y Axis Attribute** (`verticalAxisAttribute`; type: attribute, optional, data source: seriesDataSource). Attribute types: String, Enum.
- **Y Axis Sort Attribute** (`verticalSortAttribute`; type: attribute, optional, data source: seriesDataSource). Attribute to use for sorting the data. Sorting can only be used when data source is ‘Database’. For data source ‘Microflow’, the sorting should be done within the microflow. Attribute types: Decimal, Long, Integer, String, AutoNumber, DateTime.
- **Y Axis Sort Order** (`verticalSortOrder`; type: enumeration, default: asc). Allowed values: `asc` (Ascending), `desc` (Descending).

### General

- **Enable Advanced Options** (`enableAdvancedOptions`; type: boolean, default: false).
- **Show playground slot** (`showPlaygroundSlot`; type: boolean, default: false).
- **Playground slot** (`playground`; type: widgets, optional).
- **X axis label** (`xAxisLabel`; type: textTemplate, optional).
- **Y axis label** (`yAxisLabel`; type: textTemplate, optional).
- **Show Scale** (`showScale`; type: boolean, default: false).
- **Grid lines** (`gridLines`; type: enumeration, default: none). Allowed values: `none` (None), `horizontal` (Horizontal), `vertical` (Vertical), `both` (Both).

### Scale

- **Colors** (`scaleColors`; type: object, optional, list). The percentages with the colors that should be applied. At least two values needs to be specified, for 0% and 100%, else the default colors are used.
- **Percentage** (`valuePercentage`; type: integer, default: 0). The percentage at which the color should be applied. This value must be between 0 and 100.
- **Color** (`colour`; type: string). The CSS value e.g. blue, #48B0F7 or rgb(0,0,0)
- **Smooth color** (`smoothColor`; type: boolean, default: false). Gradual color gradient between data points
- **Show values** (`showValues`; type: boolean, default: false).
- **Font value color** (`valuesColor`; type: string, optional).

### Visibility

- **Visibility**. Standard Mendix system property.

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: percentage). Percentage: portion of parent size. Pixels: absolute amount of pixels. Allowed values: `percentage` (Percentage), `pixels` (Pixels).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: percentageOfWidth). Allowed values: `percentageOfWidth` (Percentage of width), `pixels` (Pixels), `percentageOfParent` (Percentage of parent).
- **Height** (`height`; type: integer, default: 75).

### Events

- **On click action** (`onClickAction`; type: action, optional, data source: seriesDataSource).
- **Tooltip hover text** (`tooltipHoverText`; type: textTemplate, optional, data source: seriesDataSource).

### Advanced

- **Enable theme folder config loading** (`enableThemeConfig`; type: boolean, default: false).
- **Custom layout** (`customLayout`; type: string, optional).
- **Custom configurations** (`customConfigurations`; type: string, optional).
- **Custom series options** (`customSeriesOptions`; type: string, optional).

### Common

- **Name**. Standard Mendix system property.
- **TabIndex**. Standard Mendix system property.
