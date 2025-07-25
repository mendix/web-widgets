# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- We fixed an issue where GoogleMap and LeafletMap uses array index for the list item which causes issues when filtering large amounts of locations. Thanks to @jeroen-huizer-conclusion for the contribution.

- We fixed an issue where where browser console throw warning of unknown listener when the location has title in LeafletMap. Thanks to @jeroen-huizer-conclusion for the contribution.

## [4.0.0] - 2024-05-02

### Fixed

- We fixed an issue where the marker wouldn’t appear at the specified location when the decimal points in the longitude and latitude values were given as commas.

### Changed

- We updated the google maps component, removing the deprecated marker and adding the advanced marker element recomended by google maps docs.

- We removed mapsStyles property used in google maps.

- We added mapId property that is required with the advanced marker element.

## [3.2.2] - 2023-09-27

### Fixed

- We removed redundant code to improve widget load time in the browser.

## [3.2.1] - 2023-08-11

### Fixed

- We fixed an issue where the marker was not at the center of the map after you zoom in to the marker. Now after you zoom in to a marker, the map will be centered around the marker.

## [3.2.0] - 2023-06-05

### Changed

- We updated the light and dark icons and tiles for the widget.

## [3.1.3] - 2023-01-04

### Changed

- We updated the dependencies

## [3.1.2] - 2022-04-25

### Changed

- We changed the Google Maps structure and design previews

## [3.1.1] - 2022-01-31

### Fixed

- We fixed the styles of maps using Open Street Maps provider which cause the screen to be puzzled. (Ticket #140400)

## [3.1.0] - 2021-12-23

### Added

- We added dark icons for Tile and List view.

### Changed

- We changed property captions for **static** and **dynamic** markers.

- We added additional description of how to use **API key**.

## [3.0.3] - 2021-11-18

### Changed

- We changed map rendering method on **Design mode**. Now, instead of rendering actual map it will render regular svg for all type of maps.

## [3.0.2] - 2021-10-28

### Changed

- We fixed an issue with auto centering the map based on the locations.

## [3.0.1] - 2021-10-13

### Changed

- We made the "Enable advanced options" available only for Studio users, keeping all the advanced features available by default in Studio Pro.

- We renamed the property `Google maps API Key` to `Geo Location API key`

- We made the property `Geo Location API key` required when using location based on Address.

## [3.0.0] - 2021-09-28

### Added

- We added a toolbox category and toolbox tile image for Studio & Studio Pro.

### Changed

- We renamed the advanced options property to emphasize this property is about the advanced properties' activation.

- We made some small code improvement.

## [2.0.3] - 2021-08-04

### Changed

- We renamed Markers and Marker list properties to Static and Dynamic markers.

## [2.0.2] - 2021-07-13

### Fixed

- We have fixed the dynamic marker data source consistency check for MX 9.2 and above.

## [2.0.1] - 2021-04-26

### Added

- Add a structure preview for each map provider.

### Changed

- Change the anchor of custom marker icons to be the center of the icon instead of the top left corner.

## Older releases

See [marketplace](https://marketplace.mendix.com/link/component/108261) for previous releases.
