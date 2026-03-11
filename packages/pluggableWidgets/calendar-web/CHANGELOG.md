# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2026-02-17

### Added

- We added support for configuring calendar time grid density via timeslots and step properties to control the widget’s required space.

### Fixed

- We fixed an issue where the “On view range changed” event nanoflow did not trigger when switching from Day/Week to Month view, causing Month view to only load events from the last week instead of the full month range.

## [2.2.0] - 2025-11-11

### Added

- You can now customize which controls appear in the calendar’s top bar and how they are arranged, with optional captions, tooltips, and a link-style appearance.

- The calendar title can be formatted consistently across views, including custom work week.

- Time formatting is applied consistently to the time gutter and to event/agenda time ranges, with robust fallbacks for invalid patterns.

### Changed

- When the event time range is disabled, events no longer display start/end time text.

### Fixed

- Fixed localization to properly display date/time formatting, weekday names, and month names based on the Mendix application's configured language.

- Fixed custom format patterns not being applied when user-defined formats were provided for toolbar items.

- Fixed "Format string contains an unescaped latin alphabet character" error when custom format fields were left empty.

- Fixed abbreviated month names (MMM format) and short weekday names reverting to English when custom formats were used.

- Fixed error when selecting a default view that was not enabled in the toolbar items configuration.

- Fixed title expression not rendering the correct value.

### Breaking changes

- Custom view buttons and their captions are now set inside the Custom top bar views configuration.

## [2.0.0] - 2025-08-12

### Breaking changes

- Initial version of Calendar pluggable widget.

- Upgrading from any v1.x to v2.0.0 preview requires re-configuring the widget in Studio Pro. The property panel has been reorganised (e.g. View settings, Custom work-week options) and missing/renamed properties will be reset to their defaults. After installing v2.0.0 open each Calendar instance, review the settings and re-select the desired values.
