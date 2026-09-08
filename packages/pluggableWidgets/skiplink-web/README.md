# SkipLink

A skip link for accessibility, allowing users to jump directly to the main content.

## Overview

- **Folder**: `skiplink-web`
- **Category**: Accessibility
- **Offline capable**: Yes

## XML Properties

- **Link text** (`linkText`; type: string, default: Skip to main content). The text displayed in the skip link.
- **Main content ID** (`mainContentId`; type: string, optional). The id of the main content element to jump to, if left empty the skip link widget will search for a main tag on the page.

## Additional Notes

Adds a skip navigation link for keyboard accessibility. The link is hidden until focused and allows users to jump directly to the main content.

## Usage

1. Add the Skip Link widget anywhere on your page, preferrably at the top or in a layout.
2. Configure the **Link Text** and **Main Content ID** properties.
3. Ensure your main content element has the specified ID, or there's a main tag on the page.

The widget automatically inserts the skip link as the first child of the `#root` element.

## Properties

- **Link Text**: Text displayed for the skip link (default: "Skip to main content").
- **Main Content ID**: ID of the main content element to focus (optional).

If the target element is not found, the widget will focus the first `<main>` element instead.

## Accessibility

The skip link is positioned absolutely at the top-left of the page, hidden by default with `transform: translateY(-120%)`, and becomes visible when focused via keyboard navigation.
