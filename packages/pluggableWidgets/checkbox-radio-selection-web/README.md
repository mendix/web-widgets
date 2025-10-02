# Checkbox Radio Selection

A widget for displaying radio button lists (single selection) and checkbox lists (multiple selection) based on different data sources.

## Features

- **Single Selection**: Radio button list for exclusive selection
- **Multiple Selection**: Checkbox list for multiple selection
- **Data Sources**: Support for context (association), database, and static data
- **Custom Content**: Ability to add custom content for options
- **Accessibility**: Full accessibility support with ARIA labels and keyboard navigation

## Configuration

The widget supports various data source types:

- **Context**: Use associations from your entity
- **Database**: Query database for selectable objects
- **Static**: Define static values directly in the widget

## Usage

1. Add the Checkbox Radio Selection widget to your page
2. Configure the data source (Context, Database, or Static)
3. Set up caption and value attributes
4. Configure selection method (single or multiple)
5. Customize styling and accessibility options

For detailed configuration options, please refer to the widget properties in Studio Pro.

## Browser Support

- Modern browsers supporting ES6+
- Internet Explorer 11+ (with polyfills)

## Development

This widget is built using:

- React 18+
- TypeScript
- Mendix Pluggable Widgets API
