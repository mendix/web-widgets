# Maps

Show locations on Maps

## Overview

- **Folder**: `maps-web`
- **Category**: Display
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/maps)

## XML Properties

### Markers

- **Marker** (`markers`; type: object, optional, list). A list of static locations on the map.

### Markers > Marker > Location

- **Location** (`locationType`; type: enumeration, default: address). Allowed values: `address` (Based on address), `latlng` (Based on latitude and longitude).
- **Address** (`address`; type: textTemplate, optional). Address containing (a subset of) street, number, zipcode, city and country.
- **Latitude** (`latitude`; type: textTemplate, optional). Decimal number from -90.0 to 90.0.
- **Longitude** (`longitude`; type: textTemplate, optional). Decimal number from -180.0 to 180.0.
- **Title** (`title`; type: textTemplate, optional). Title displayed when clicking the marker.

### Markers > Marker > Events

- **On click** (`onClick`; type: action, optional).

### Markers > Marker > Visualization

- **Marker style** (`markerStyle`; type: enumeration, default: default). Allowed values: `default` (Default), `image` (Image).
- **Image** (`customMarker`; type: image, optional). Image that replaces the default icon.

- **Marker list** (`dynamicMarkers`; type: object, optional, list). A list of markers showing dynamic locations on the map.

### Markers > Marker list > Location

- **Data source** (`markersDS`; type: datasource, optional, list).
- **Location** (`locationType`; type: enumeration, default: address). Allowed values: `address` (Based on address), `latlng` (Based on latitude and longitude).
- **Address** (`address`; type: attribute, optional, data source: markersDS). Address containing (a subset of) street, number, zipcode, city and country. Attribute types: String.
- **Latitude** (`latitude`; type: attribute, optional, data source: markersDS). Decimal number from -90.0 to 90.0. Attribute types: Decimal.
- **Longitude** (`longitude`; type: attribute, optional, data source: markersDS). Decimal number from -180.0 to 180.0. Attribute types: Decimal.
- **Title** (`title`; type: attribute, optional, data source: markersDS). Title displayed when clicking the marker. Attribute types: String.

### Markers > Marker list > Events

- **On click** (`onClickAttribute`; type: action, optional, data source: markersDS).

### Markers > Marker list > Visualization

- **Marker style** (`markerStyleDynamic`; type: enumeration, default: default). Allowed values: `default` (Default), `image` (Image).
- **Image** (`customMarkerDynamic`; type: image, optional). Image that replaces the default icon.

### Configurations

- **API Key** (`apiKey`; type: string, optional). API Key for usage of the map through the selected provider.Google Maps - https://developers.google.com/maps/documentation/javascript/get-api-key Map Box - https://docs.mapbox.com/help/getting-started/access-tokens/ Here Maps - https://developer.here.com/tutorials/getting-here-credentials/
- **API Key** (`apiKeyExp`; type: expression, optional). API Key for usage of the map through the selected provider.Google Maps - https://developers.google.com/maps/documentation/javascript/get-api-key Map Box - https://docs.mapbox.com/help/getting-started/access-tokens/ Here Maps - https://developer.here.com/tutorials/getting-here-credentials/ Returns: String.
- **Geo location API key** (`geodecodeApiKey`; type: string, optional). Used to translate addresses to latitude and longitude. This API Key should be a Google Geocoding API Key found in https://developers.google.com/maps/documentation/geocoding/overview
- **Geo location API key** (`geodecodeApiKeyExp`; type: expression, optional). Used to translate addresses to latitude and longitude. This API Key should be a Google Geocoding API Key found in https://developers.google.com/maps/documentation/geocoding/overview Returns: String.
- **Show current location marker** (`showCurrentLocation`; type: boolean, default: false). Shows the user current location marker.

### General

- **Drag** (`optionDrag`; type: boolean, default: true). The center will move when end-users drag the map.
- **Scroll to zoom** (`optionScroll`; type: boolean, default: true). The map is zoomed with a mouse scroll.
- **Zoom** (`optionZoomControl`; type: boolean, default: true). Show zoom controls [ + ] [ - ].
- **Attribution control** (`attributionControl`; type: boolean, default: true). Add attributions to the map (credits).
- **Street view** (`optionStreetView`; type: boolean, default: true). Enables the Street View control.
- **Map type** (`mapTypeControl`; type: boolean, default: true). Enables switching between different map types.
- **Full screen** (`fullScreenControl`; type: boolean, default: true).
- **Rotate** (`rotateControl`; type: boolean, default: true).

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: percentage). Percentage: portion of parent size. Pixels: absolute amount of pixels. Allowed values: `percentage` (Percentage), `pixels` (Pixels).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: percentageOfWidth). Allowed values: `percentageOfWidth` (Percentage of width), `pixels` (Pixels), `percentageOfParent` (Percentage of parent).
- **Height** (`height`; type: integer, default: 75).
- **Zoom level** (`zoom`; type: enumeration, default: automatic). Allowed values: `automatic` (Automatic), `world` (World), `continent` (Continent), `city` (City), `street` (Street), `buildings` (Buildings).

### General

- **Map provider** (`mapProvider`; type: enumeration, default: googleMaps). Allowed values: `googleMaps` (Google Maps), `openStreet` (Open street), `mapBox` (Map box), `hereMaps` (Here Maps).
- **Google MapId key** (`googleMapId`; type: string, required). Used to render and style the Google map. This MapId key from Google can be found in https://developers.google.com/maps/documentation/get-map-id
