# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.4.0] FileUploader - 2025-12-10

### [2.4.0] FileUploader

#### Added

- We added configuration options to execute actions after both successful and unsuccessful file uploads.

## [2.3.0] FileUploader - 2025-08-15

### [2.3.0] FileUploader

#### Fixed

- We improved the file extension validation to allow special characters like dashes and plus signs (e.g., '.tar-gz', '.c++').

- We clarified error messages for invalid file extensions to better explain the expected format.

- We fixed an issue where file uploader can still add more files when refreshed eventhough the number of maximum uploaded files has been reached.

#### Changed

- We change the max file configuration to set maximum number of uploaded files through expression.

## [2.2.2] FileUploader - 2025-07-01

### [2.2.2] FileUploader

#### Fixed

- We fixed image thumbnail issue that was failed to reload on refresh page.

## [2.2.1] FileUploader - 2025-05-28

### [2.2.1] FileUploader

#### Fixed

- We updated file size display in the file uploader to show commonly used units (KB, MB, GB) instead of previously incorrect units (Kb, Mb, Gb). Instead of using technically correct binary units (KiB, MiB, GiB), we chose a format more familiar to users.

## [2.2.0] FileUploader - 2025-05-07

### [2.2.0] FileUploader

#### Added

- We made "Associated files/images" preconfigured with corresponding entities.

- We made it possible to configure custom buttons for file uploader entries.

#### Fixed

- We fixed an issue with hover colors of the dropzone

## [2.1.0] FileUploader - 2025-04-16

### [2.1.0] FileUploader

#### Changed

- We updated studio pro minimum version to 10.21 to support Mendix 11.

## [2.0.0] FileUploader - 2025-03-14

### Changed

- Bump the minimum supported version to 10.15.

### [2.0.0] FileUploader

#### Added

- We made "Action to create new files/images" preconfigured with corresponding nanoflows.

## [1.0.3] FileUploader - 2025-02-28

### [1.0.3] FileUploader

#### Fixed

- We fixed an issue with long file names causing text to extend beyond the widget.

## [1.0.2] FileUploader - 2025-02-14

### Added

- We added a module user role that have permissions to upload files and images.

### [1.0.2] FileUploader

#### Fixed

- We fixed an issue where an error occurred when uploading multiple files on a newly created context object.

- We fixed an issue where, in image mode, users could upload unsupported image formats.

#### Added

- We improved handling of the File/Image creation action. It is now easier to spot misconfigured actions through console warnings.

- We added timeout functionality for the File/Image creation action. It will abort the file uploading process if an object is not created within a certain time.

- We added a setting to enable read-only mode.

## [1.0.1] FileUploader - 2025-12-19

### [1.0.1] FileUploader

#### Added

- The file uploader widget enables you to upload files by dragging and dropping them onto the widget or by using the file selection dialog.
