# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.4] - 2023-11-29

### Fixed

-   We fix an issue with toolbars content incorrect display on mouse hover.

## [2.2.3] - 2023-10-27

### Fixed

-   We fix an issue with Editor intermittenly not displaying data.

## [2.2.2] - 2023-10-12

### Breaking changes

-   Added Insert toolbar group as an option for custom toolbar

## [2.2.1] - 2023-09-27

### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [2.2.0] - 2023-06-06

### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

## [2.1.6] - 2023-04-18

### Fixed

-   We fixed an issue when Rich Text widget not saving data when user leaves the page quickly after editing.

### Security

-   Update ckeditor4 to version 4.21.0

## [2.1.5] - 2023-03-24

### Fixed

-   We fixed an issue when Rich Text widget loosing focus after running onChange or onKeyPress microflow.

## [2.1.4] - 2023-03-22

### Fixed

-   We fixed an issue with Rich Text widget not working correctly when another Rich Text widget is opened in a popup.

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
