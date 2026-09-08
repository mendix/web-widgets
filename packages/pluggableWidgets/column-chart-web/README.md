# Column chart

Create a column chart

## Overview

- **Folder**: `column-chart-web`
- **Category**: Charts
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/charts#2-3-column-chart)

## XML Properties

### Data Source

- **Series** (`series`; type: object, list). Add one or more columns. The order influences how columns overlay one another: the first column (from the top) is drawn lowest and other columns are drawn on top of it.
- **Data set** (`dataSet`; type: enumeration, default: static). Allowed values: `static` (Single series), `dynamic` (Multiple series).
- **Data source** (`staticDataSource`; type: datasource, optional, list). Data points for a single column.
- **Data source** (`dynamicDataSource`; type: datasource, optional, list). Data points for all columns which will be divided into single columns based on the Group by attribute value.
- **Group by** (`groupByAttribute`; type: attribute, optional, data source: dynamicDataSource). Data points within the same group form one column. Attribute types: String, Boolean, DateTime, Decimal, Enum, HashString, Integer, Long.
- **Series name** (`staticName`; type: textTemplate, optional). The column name displayed in the legend.
- **Series name** (`dynamicName`; type: textTemplate, optional, data source: dynamicDataSource). The column name displayed in the legend.
- **X axis attribute** (`staticXAttribute`; type: attribute, optional, data source: staticDataSource). Attribute types: String, DateTime, Decimal, Integer, Long, AutoNumber.
- **X axis attribute** (`dynamicXAttribute`; type: attribute, optional, data source: dynamicDataSource). Attribute types: String, DateTime, Decimal, Integer, Long, AutoNumber.
- **Y axis attribute** (`staticYAttribute`; type: attribute, optional, data source: staticDataSource). Attribute types: String, DateTime, Decimal, Integer, Long, AutoNumber.
- **Y axis attribute** (`dynamicYAttribute`; type: attribute, optional, data source: dynamicDataSource). Attribute types: String, DateTime, Decimal, Integer, Long, AutoNumber.
- **Aggregation function** (`aggregationType`; type: enumeration, default: none). Defines how data is aggregated when multiple Y values are available for a single X value Allowed values: `none` (None), `count` (Count), `sum` (Sum), `avg` (Average), `min` (Minimum), `max` (Maximum), `median` (Median), `mode` (Mode), `first` (First), `last` (Last).
- **Tooltip hover text** (`staticTooltipHoverText`; type: textTemplate, optional, data source: staticDataSource).
- **Tooltip hover text** (`dynamicTooltipHoverText`; type: textTemplate, optional, data source: dynamicDataSource).
- **Column color** (`staticBarColor`; type: expression, optional, data source: staticDataSource). Returns: String.
- **Column color** (`dynamicBarColor`; type: expression, optional, data source: dynamicDataSource). Returns: String.
- **On click action** (`staticOnClickAction`; type: action, optional, data source: staticDataSource).
- **On click action** (`dynamicOnClickAction`; type: action, optional, data source: dynamicDataSource).
- **Custom series options** (`customSeriesOptions`; type: string, optional).

### General

- **Enable advanced options** (`advancedOptions`; type: boolean, default: false).
- **Show playground slot** (`showPlaygroundSlot`; type: boolean, default: false).
- **Playground slot** (`playground`; type: widgets, optional).
- **X axis label** (`xAxisLabel`; type: textTemplate, optional).
- **Y axis label** (`yAxisLabel`; type: textTemplate, optional).
- **Show legend** (`showLegend`; type: boolean, default: true).
- **Grid lines** (`gridLines`; type: enumeration, default: none). Allowed values: `none` (None), `horizontal` (Horizontal), `vertical` (Vertical), `both` (Both).
- **Column format** (`barmode`; type: enumeration, default: group). Allowed values: `group` (Grouped), `stack` (Stacked).

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

### Advanced

- **Enable theme folder config loading** (`enableThemeConfig`; type: boolean, default: false).
- **Custom layout** (`customLayout`; type: string, optional).
- **Custom configurations** (`customConfigurations`; type: string, optional).
