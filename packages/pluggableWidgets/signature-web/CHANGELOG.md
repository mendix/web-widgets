# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking changes

- **Complete rewrite using Pluggable Widget API** - Migrated from Custom Widget (v1.x) to Pluggable Widget architecture
- **Minimum Mendix version increased** - Now requires Mendix 11.8.0 or higher (previously 7.13.1)
- **Widget ID changed** - From `com.mendix.widget.custom.signature.Signature` to `com.mendix.widget.web.signature.Signature`
- **No backward compatibility** - Existing implementations using v1.x must be reconfigured

### Added

- Added custom filename support via `fileName` property (textTemplate)
- Added `onSignEndAction` event that triggers after each stroke with signature image URI parameter
- Added enhanced dimension controls (min/max height, viewport units, overflow options)
- Added comprehensive unit tests for signature functionality
- Added interactive editor preview showing grid and dimensions in Studio Pro
- Added support for ValidationAlert from `@mendix/widget-plugin-component-kit`

### Changed

- Migrated from class-based React components to functional components with hooks
- Replaced manual subscription management with declarative Mendix Pluggable Widget API
- Replaced Webpack build system with Rollup
- Converted `SizeContainer` from TypeScript to JSX for better React integration
- Improved signature pad lifecycle management with `useSignaturePad` hook
- Enhanced canvas resize behavior to preserve signature data
- Updated icons and tiles for better Studio Pro visibility

### Fixed

- Fixed canvas initialization timing issues
- Fixed signature persistence during container resize
- Fixed read-only mode toggle behavior
- Fixed validation message display

### Removed

- Removed `SignatureContainer` wrapper component (no longer needed with Pluggable API)
- Removed manual subscription handles and form listeners
- Removed custom ResizeObserver hook (now uses native ResizeObserver directly)
- Removed `UNSAFE_componentWillReceiveProps` lifecycle methods
- Removed support for Mendix versions below 11.8.0
