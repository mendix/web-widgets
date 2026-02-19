# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- We fixed an issue with burst action execution which was still happening in some cases.

## [1.2.0] - 2025-11-07

### Fixed

- We fixed an issue with burst executon in inactive tabs.

### Changed

- Repeated execution is not executing next action if previous execution is not yet finished.

## [1.1.0] - 2025-08-12

### Added

- Added support for using expressions to configure both delay and repeat interval values during component load. Expression support was also extended to delay values when attributes change dynamically.

## [1.0.1] - 2024-04-25

### Fixed

- We fixed issues where event not fired with MF/NF having parameters.

## [1.0.0] - 2024-03-19

### Added

- initial version of app events with component load and attribute change listener.
