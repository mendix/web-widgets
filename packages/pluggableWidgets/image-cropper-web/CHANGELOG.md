# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added an "Initial crop size (%)" property to control how much of the image the crop box covers when it first appears and after Reset. Previously this was hardcoded to 80%; the default is now 100% (the full image).

## [1.1.0] - 2026-08-11

### Added

- Custom aspect ratio width and height can now be set with an expression or bound to an attribute.

### Fixed

- The crop selection no longer briefly appears at the wrong ratio while a custom aspect ratio expression is still loading.

- The crop selection is no longer cleared and the image no longer reloaded when unrelated properties on the page change.

## [1.0.0] - 2026-07-14

### Added

- Initial release of Image cropper widget.
