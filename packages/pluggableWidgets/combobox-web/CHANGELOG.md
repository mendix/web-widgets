# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2024-01-15

### Changed

-   We changed **Select/Unselect button** caption into **Show Select all** for easier understanding

## [1.1.0] - 2024-01-14

### Added

-   We added a new property named **Show footer**, enabling the Combobox widget to display a footer within its menu. When **Show footer** is set to **Yes**, developers can include custom footer content such as text, buttons, links, etc.

-   We added a new property named **Select/Unselect button**, enabling the Combobox widget to display a select/unselect all button on the top of the menu list.

### Fixed

-   Sorting of the search results now follow the sort order set for Selectable objects.

-   We removed the clear button on selected item labels in read-only state.

-   We fixed the positioning of the menu when it is flipped and collides with top of the viewport.

-   We fixed single selection combo box losing focus after selecting an item.
