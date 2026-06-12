# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking changes

- **Complete rewrite using Pluggable Widget API** - Migrated from Custom Widget (v1.x) to Pluggable Widget architecture
- **Minimum Mendix version increased** - Now requires Mendix 11.8.0 or higher (previously 7.13.1)
- **No backward compatibility** - Existing implementations using v1.x must be reconfigured
- **Widget ID changed** - From `com.mendix.widget.custom.signature.Signature` to `com.mendix.widget.web.signature.Signature`
- **Widget MPK renamed** - From `Signature.mpk` to `com.mendix.widget.web.Signature.mpk`. This allows the old and new versions to coexist during migration. The old `Signature.mpk` needs to be removed from your project's widget folder manually once migration is complete
- **Widget category changed** - From `Add-ons` to `Input elements`.

### Added

- Added custom filename support via `fileName` property (textTemplate)
- Added `onSignEndAction` event that triggers after each stroke with signature image URI parameter
- Added enhanced dimension controls (min/max height, viewport units, overflow options)
