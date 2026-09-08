# Custom chart

Create a custom chart

## Overview

- **Folder**: `custom-chart-web`
- **Category**: Charts
- **Offline capable**: Yes

## XML Properties

- **Static** (`dataStatic`; type: string, optional). Data JSON array based on https://plot.ly/javascript/reference/
- **Source attribute** (`dataAttribute`; type: attribute, optional). The attribute data will merge and overwrite 'Static' data Attribute types: String.
- **Sample data** (`sampleData`; type: string, optional). Data for preview. It will be merged with the 'Static data' in the web modeler or at runtime when no 'Source attribute' is selected
- **Show playground slot** (`showPlaygroundSlot`; type: boolean, default: false).
- **Playground slot** (`playground`; type: widgets, optional).
- **Static** (`layoutStatic`; type: string, optional). JSON object based on https://plot.ly/javascript/reference/
- **Source attribute** (`layoutAttribute`; type: attribute, optional). Attribute layout will merge and overwrite static layout options Attribute types: String.
- **Sample layout** (`sampleLayout`; type: string, optional). Layout options for preview. It will be merged with the 'Static' in the web modeler or at runtime when no 'Source attribute' is selected
- **Configuration options** (`configurationOptions`; type: string, optional). The JSON containing the Plotly configuration options

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: percentage). Allowed values: `pixels` (Pixels), `percentage` (Percentage).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: percentageOfWidth). Allowed values: `percentageOfWidth` (Auto), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Height** (`height`; type: integer, default: 100).
- **Minimum Height unit** (`minHeightUnit`; type: enumeration, default: none). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Minimum height** (`minHeight`; type: integer, default: 250).
- **Maximum Height unit** (`maxHeightUnit`; type: enumeration, default: none). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Maximum height** (`maxHeight`; type: integer, default: 250).
- **Vertical Overflow** (`OverflowY`; type: enumeration, default: auto). Allowed values: `auto` (Auto), `scroll` (Scroll), `hidden` (Hidden).

- **On click** (`onClick`; type: action, optional).
- **Event data attribute** (`eventDataAttribute`; type: attribute, optional). The attribute to store received raw data from the chart event. https://plot.ly/javascript/plotlyjs-events/#event-data Attribute types: String.
- **Name**. Standard Mendix system property.
- **TabIndex**. Standard Mendix system property.

## Additional Notes

## Custom chart

[My widget description]

## Features

[feature highlights]

## Usage

[step by step instructions]

## Demo project

[link to sandbox]

## Issues, suggestions and feature requests

[link to GitHub issues]

## Development and contribution

1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing `npm -v`, execute: `npm install --legacy-peer-deps`.
1. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.

[specify contribution]
