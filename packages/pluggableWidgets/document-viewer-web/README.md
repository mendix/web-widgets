# Document Viewer

View PDF and other document types

## Overview

- **Folder**: `document-viewer-web`
- **Category**: Display
- **Offline capable**: Yes

## XML Properties

### Data source

- **Document** (`file`; type: file, required). The document to display in the viewer

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: contentFit). Allowed values: `pixels` (Pixels), `percentage` (Percentage), `contentFit` (Fit to content).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: percentageOfWidth). Allowed values: `percentageOfWidth` (Auto), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Height** (`height`; type: integer, default: 250).
- **Minimum height unit** (`minHeightUnit`; type: enumeration, default: none). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Minimum height** (`minHeight`; type: integer, default: 250).
- **Maximum height unit** (`maxHeightUnit`; type: enumeration, default: none). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Maximum height** (`maxHeight`; type: integer, default: 250).
- **Vertical overflow** (`overflowY`; type: enumeration, default: auto). Allowed values: `auto` (Auto), `scroll` (Scroll), `hidden` (Hidden).

- **PDF.js worker URL** (`pdfjsWorkerUrl`; type: textTemplate, optional). URL to the PDF.js worker script. Change this if you want to host the script yourself. Leave empty to use the default URL.
- **Name**. Standard Mendix system property.
- **TabIndex**. Standard Mendix system property.
- **Visibility**. Standard Mendix system property.
