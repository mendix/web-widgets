# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.3.0] - 2025-02-14

### Fixed

-   We fixed minor HTML bugs whereas rich text will add extra new lines on saving value.

-   We fixed rich text accessibility with tab keypress. Pressing tab will now allow you to directly focus on editor and Alt + F10 will brings you directly to toolbar.

## [4.2.0] - 2025-01-15

### Fixed

-   We fixed readonly styling for Read Panel mode.

### Changed

-   We changed dimension configurations to better match CSS formats.

-   We changed DOM order to show editor before toolbar for easier focus order.

## [4.1.0] - 2024-12-13

### Fixed

-   We fixed an issue where the attribute not refreshed when the widget is not reloaded.

### Added

-   We allow user to create html button tag on the widget.

## [4.0.0] - 2024-10-29

### Breaking changes

-   The Rich Text widget has been updated to use Quill V2 due to a license change in TinyMCE. Unlike TinyMCE, Quill V2 does not require rendering a separate iframe, which simplifies styling and content security configurations. Users should review and adjust their widget configurations after updating.

## [3.3.1] - 2024-08-28

### Changed

-   Changed action required to false to avoid unnecessary warnings in the Studio Pro.

## [3.3.0] - 2024-08-16

### Added

-   We add new advance config to allow user to disable relative url conversion.

## [3.2.4] - 2024-07-16

### Changed

-   We allow users to turned off sandbox_iframes through configurations.

## [3.2.3] - 2024-06-25

### Fixed

-   We update the dependency to TinyMCE 6.8.4 in order to solve security issue.

## [3.2.2] - 2024-06-05

### Fixed

-   We fixed an issue where in some cases rich text display loading screen infinitely.

-   We optimized rich text bundle size.

## [3.2.1] - 2024-05-27

### Added

-   We add on change and on key press events to make upgrade consistent from previous version.

## [3.2.0] - 2024-05-21

### Added

-   We add options to include external styling in advance tab. the style can be included in theme folder. and this is also allow user to switch between built-in style theme: 'default' and 'dark'.

### Fixed

-   We fixed issue where rich text body font style overriding the page body style in inline mode.

## [3.1.2] - 2024-05-10

### Changed

-   We add more options to the rich text's context menu and give user the options to use native context menu as well.

## [3.1.1] - 2024-05-02

### Fixed

-   We fixed tab index not working on Editor.

-   We fix security issue by setting sandbox_iframes and convert_unsafe_embeds to true.

## [3.1.0] - 2024-04-23

### Changed

-   We allow user to disable quick toolbar.

### Fixed

-   We fixed styling to match atlas styles.

-   We re-introduce readonly style.

-   We fixed editor height configuration can't be changed.

## [3.0.2] - 2024-04-04

### Fixed

-   We fix issue with menubar and statusbar not showing on sub-folder deployment.

## [3.0.1] - 2024-03-12

### Changed

-   We update the widget icons.

### Fixed

-   We removed toolbar, menubar, and statusbar on readonly.

## [3.0.0] - 2024-02-28

### Breaking changes

-   Due to the end of life for CKEditor4, We have now build a new rich text editor with different engine, TinyMCE. This is a major version upgrade. The widget configuration is changing, please review your configuration after updating.

## [2.3.0] - 2024-02-08

### Fixed

-   We disabled the version check from CKEditor 4, which generated security alert in all widget instances.

### Added

-   We add validation message for rich text editor.

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
