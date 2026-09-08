# Time series

Create a time series chart

## Overview

- **Folder**: `time-series-chart-web`
- **Category**: Charts
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/time-series-chart)

## XML Properties

### Data source

- **Series** (`lines`; type: object, list). Add one or more series. The order of series influences how lines overlay one another: the first line (from the top) is drawn lowest and other lines are drawn on top of it.
- **Data set** (`dataSet`; type: enumeration, default: static). Allowed values: `static` (Single series), `dynamic` (Multiple series).
- **Data source** (`staticDataSource`; type: datasource, optional, list). Data points for a single line.
- **Data source** (`dynamicDataSource`; type: datasource, optional, list). Data points for all lines which will be divided into single lines based on the Group by attribute value.
- **Series name** (`staticName`; type: textTemplate, optional). The line name displayed in the legend.
- **Series name** (`dynamicName`; type: textTemplate, optional, data source: dynamicDataSource). The line name displayed in the legend.
- **Group by** (`groupByAttribute`; type: attribute, optional, data source: dynamicDataSource). Data points within the same group form one line. Attribute types: String, Boolean, DateTime, Decimal, Enum, HashString, Integer, Long.
- **X axis attribute** (`staticXAttribute`; type: attribute, optional, data source: staticDataSource). Attribute types: DateTime.
- **X axis attribute** (`dynamicXAttribute`; type: attribute, optional, data source: dynamicDataSource). Attribute types: DateTime.
- **Y axis attribute** (`staticYAttribute`; type: attribute, optional, data source: staticDataSource). Attribute types: String, Enum, DateTime, Decimal, Integer, Long, AutoNumber.
- **Y axis attribute** (`dynamicYAttribute`; type: attribute, optional, data source: dynamicDataSource). Attribute types: String, Enum, DateTime, Decimal, Integer, Long, AutoNumber.
- **Aggregation function** (`aggregationType`; type: enumeration, default: none). Defines how data is aggregated when multiple Y values are available for a single X value Allowed values: `none` (None), `count` (Count), `sum` (Sum), `avg` (Average), `min` (Minimum), `max` (Maximum), `median` (Median), `mode` (Mode), `first` (First), `last` (Last).
- **Tooltip hover text** (`staticTooltipHoverText`; type: textTemplate, optional, data source: staticDataSource).
- **Tooltip hover text** (`dynamicTooltipHoverText`; type: textTemplate, optional, data source: dynamicDataSource).
- **Interpolation** (`interpolation`; type: enumeration, default: linear). Allowed values: `linear` (Linear), `spline` (Curved).
- **Line style** (`lineStyle`; type: enumeration, default: line). Allowed values: `line` (Line), `lineWithMarkers` (Line with markers), `custom` (Custom).
- **Line color** (`lineColor`; type: textTemplate, optional).
- **Marker color** (`markerColor`; type: textTemplate, optional).
- **Fill area** (`enableFillArea`; type: boolean, default: true). Fill area between data point and x-axis
- **Area color** (`fillColor`; type: textTemplate, optional). By default, the border color with transparency is used
- **On click action** (`staticOnClickAction`; type: action, optional, data source: staticDataSource).
- **On click action** (`dynamicOnClickAction`; type: action, optional, data source: dynamicDataSource).
- **Custom series options** (`customSeriesOptions`; type: string, optional).

### General

- **Enable advanced options** (`enableAdvancedOptions`; type: boolean, default: false).
- **Show playground slot** (`showPlaygroundSlot`; type: boolean, default: false).
- **Playground slot** (`playground`; type: widgets, optional).
- **X axis label** (`xAxisLabel`; type: textTemplate, optional).
- **Y axis label** (`yAxisLabel`; type: textTemplate, optional).
- **Show legend** (`showLegend`; type: boolean, default: true).
- **Show range slider** (`showRangeSlider`; type: boolean, default: true).
- **Grid lines** (`gridLines`; type: enumeration, default: none). Allowed values: `none` (None), `horizontal` (Horizontal), `vertical` (Vertical), `both` (Both).

### Common

- **Name**. Standard Mendix system property.
- **Visibility**. Standard Mendix system property.
- **TabIndex**. Standard Mendix system property.

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: percentage). Percentage: portion of parent size. Pixels: absolute amount of pixels. Allowed values: `percentage` (Percentage), `pixels` (Pixels).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: percentageOfWidth). Allowed values: `percentageOfWidth` (Percentage of width), `pixels` (Pixels), `percentageOfParent` (Percentage of parent).
- **Height** (`height`; type: integer, default: 75).

### Advanced

- **Enable theme folder config loading** (`enableThemeConfig`; type: boolean, default: false).
- **Custom layout** (`customLayout`; type: string, optional).
- **Custom configurations** (`customConfigurations`; type: string, optional).
- **Y-axis range mode** (`yAxisRangeMode`; type: enumeration, default: tozero). Controls the y-axis range. "From zero" starts the y-axis from zero. "Auto" sets the range based on the plotted values. "Non-negative" only shows a range of positive values. If the series "Fill area" property is set to "yes", the range mode is set to "From zero" by default. Allowed values: `normal` (Auto), `tozero` (From zero), `nonnegative` (Non-negative).
