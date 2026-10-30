# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- An "Initial crop size (%)" property now sets the size of the crop box when it first appears and after Reset. The default is 80%, the same as before.

### Fixed

- The initial crop box no longer fills the full image height for aspect ratios narrower than the image (for example, 1:1 on a landscape image). It now covers the configured percentage of the largest box that fits.

## [1.1.0] - 2026-08-11

### Added

- Custom aspect ratio width and height can now be set with an expression or bound to an attribute.

### Fixed

- The crop selection no longer briefly appears at the wrong ratio while a custom aspect ratio expression is still loading.

- The crop selection is no longer cleared and the image no longer reloaded when unrelated properties on the page change.

## [1.0.0] - 2026-07-14

### Added

- Initial release of Image cropper widget.
