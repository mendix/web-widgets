# Screenshot Updater

CLI tool for updating Playwright screenshots for Mendix widgets using Docker and Mendix runtime.

## Quick Start

```bash
# From project root (recommended)
pnpm run update-screenshots update <widget-name>

# Or from automation/utils
cd automation/utils && pnpm run update-screenshots update <widget-name>
```

## Prerequisites

- Docker running
- GitHub token (for Atlas updates): `export GITHUB_TOKEN=your_token`

## Commands

```bash
# List available widgets
pnpm run update-screenshots list

# Update screenshots
pnpm run update-screenshots update calendar-web

# Use specific Mendix version
pnpm run update-screenshots update calendar-web --mendix-version 10.24.0.73019

# Skip Atlas theme updates (faster)
pnpm run update-screenshots update calendar-web --skip-atlas-themesource

# List available Mendix versions
pnpm run update-screenshots versions
```

## How It Works

1. Downloads test project from GitHub
2. Builds widget and copies to test project
3. Updates Atlas components (if not skipped)
4. Creates Mendix deployment bundle
5. Starts Mendix runtime in Docker
6. Runs Playwright tests to update screenshots
7. Cleans up containers and temp files

## Configuration

| Environment Variable | Description                                 | Default                    |
| -------------------- | ------------------------------------------- | -------------------------- |
| `GITHUB_TOKEN`       | GitHub access token                         | Required for Atlas updates |
| `LOG_LEVEL`          | Logging verbosity (`debug`, `info`, `warn`) | `info`                     |

## Troubleshooting

**Docker issues**: Ensure Docker is running (`docker info`)  
**Widget not found**: Check available widgets with `list` command  
**Build failures**: Enable debug logging (`LOG_LEVEL=debug`)  
**Detailed logs**: Check `screenshot-updater.log`
