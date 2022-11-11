# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.1] Charts - 2022-11-10

### Changed

-   Data series that have null values now handled correctly.

## [4.0.0] Charts - 2022-10-27

### Breaking changes

-   We removed all deprecated chart widgets. If your app uses deprecated chart widgets, you must manually replace them with new ones.

## [2.0.0] Charts - 2021-09-28

### Added

-   We added a toolbox category and toolbox tile image for Studio & Studio Pro.

## [1.4.12] Charts - 2021-08-04

### Fixed

-   We fixed an issue with sorting using XPath and attribute over-association (Ticket #105229).

### Removed

-   We've removed deprecated APIs warnings

## [1.4.11] Charts - 2021-04-28

### Fixed

-   Fixed an issue where grouped legends were not working.

-   Maintain compatibility with Mendix client in MX 7, 8 and 9.

-   Fix localized date handling.

### Changed

-   Update `plotly.js` dependency.

-   Update `react-ace` dependency and switch `brace` for `ace-builds`.

### Security

-   Patch `lodash` vulnerability.

-   Update `fast-json-patch` dependency.

## Previous versions

See [marketplace](https://marketplace.mendix.com/link/component/105695) notes.
