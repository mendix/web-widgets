# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1] - 2024-08-23

### Security

-   Updated dompurify library to version 2.5.6 to prevent template injection.

## [1.2.0] - 2024-02-01

### Added

-   It is now possible to pass configuration to the underlying HTML sanitization library. This makes it possible to extend default configuration that might be too restrictive for certain advanced use cases.

## [1.1.1] - 2023-09-27

### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [1.1.0] - 2023-06-05

### Changed

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

## [1.0.1] - 2023-01-05

### Fixed

-   We fixed an issue with HTML Element widget producing errors in Studio Pro versions below 9.18.

-   We fixed an issue with inline CSS styles parsing

## [1.0.0] - 2022-11-24

### Added

-   We introduced HTML Element widget!
