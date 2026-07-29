# Changelog

All notable changes to this MCP server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- We introduce pluggable-widgets-mcp: an MCP server that scaffolds, configures, builds and deploys
  Mendix pluggable widgets.
- `set-widget-properties` writes a widget's XML from a declarative property model.
- Guideline resources `mendix://guidelines/property-types` and `mendix://guidelines/widget-patterns`.
- `MCP_EXTRA_ALLOWED_PATHS` and `MCP_LOG_LEVEL` configuration.

### Changed

- The Mendix project directory is the single sandbox root, and widgets are scaffolded into
  `{project}/widget-sources/`. Nothing is derived from `process.cwd()`, which previously moved the
  security boundary depending on which host spawned the server.
- The widget generator runs in-process through a Yeoman answer adapter instead of a CLI invocation
  whose output was scraped for progress. Scaffolding and dependency installation are separate steps
  with separate timeouts and separately reported outcomes.
- Build success is the child process's exit code. It was previously inferred from substrings in the
  build output, so a build that printed a stale artifact path and then failed looked successful.
- The HTTP transport is stateless and binds `127.0.0.1`. It previously bound all interfaces and kept
  a session map that could not be emptied.
- Tool descriptions state what a tool does; the widget workflow is described once in the server
  instructions.

### Removed

- The in-process TSX generator. Component source is written by the client model against the
  `widget-patterns` resource; the generator emitted code that did not compile in several cases.
- Keyword-based property suggestion and widget-pattern detection.
- File-lifecycle cleanup that deleted unrelated files from a widget's `src/`.
