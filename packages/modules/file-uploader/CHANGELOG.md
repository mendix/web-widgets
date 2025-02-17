# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] FileUploader - 2025-02-14

### Added

-   We added a module user role that have permissions to upload files and images.

### [1.0.2] FileUploader

#### Fixed

-   We fixed an issue where an error occurred when uploading multiple files on a newly created context object.

-   We fixed an issue where, in image mode, users could upload unsupported image formats.

#### Added

-   We improved handling of the File/Image creation action. It is now easier to spot misconfigured actions through console warnings.

-   We added timeout functionality for the File/Image creation action. It will abort the file uploading process if an object is not created within a certain time.

-   We added a setting to enable read-only mode.

## [1.0.1] FileUploader - 2025-12-19

### [1.0.1] FileUploader

#### Added

-   The file uploader widget enables you to upload files by dragging and dropping them onto the widget or by using the file selection dialog.
