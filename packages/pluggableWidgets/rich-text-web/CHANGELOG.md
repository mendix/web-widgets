# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.3] - 2023-01-31

### Fixed

-   Added 1MB file size limit for pasted and dropped images.

## [2.1.2] - 2023-01-25

### Fixed

-   We fixed an issue with attribute value override when Data view update widget props.

-   We fixed the issue with underline toolbar not showing after setting 'Custom toolbar' property.

-   We fixed an issue with image tag being removed on content sanitization.

### Added

-   We added an indent plugin.

### Changed

-   We changed openlink action to open links just on mouse click (without ctrl).

## [2.1.1] - 2023-01-19

### Fixed

-   Using editable settings, when switch from readonly state to editable then it is possible to change the text

## [2.1.0] - 2022-11-22

### Security

-   Update ckeditor4 to version 4.20.0 to prevent XSS

### Changed

-   Remove CSS file for WebSpellChecker Dialog plugin as it rich end of support from ckeditor4

## [2.0.1] - 2022-05-23

### Changed

-   We changed the behavior on clicking the links in rich text editor. CMD/CTRL + Click will open a link in new tab.

## [2.0.0] - 2022-02-25

### Added

-   We added a lot of cool features such as code highlight, allow-disallow content filtering, customizable toolbar, general toolbar presets (**Basic**, **Advanced**, **Full**).

-   We added read only style modes.

-   We added editor style mode **(Toolbar | Inline)**.

### Changed

-   We changed the core library for Rich Text. Moved from Quill to CKEditor4.

## [1.3.9] - 2021-08-11

### Changed

-   We changed the behavior of Rich Text that could steal the focus while updating the content.
