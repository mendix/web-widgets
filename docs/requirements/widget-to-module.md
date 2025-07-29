# Converting a Pluggable Widget into a Mendix **Module**

This guide documents a repeatable workflow for converting any pluggable widget package (for example, **@mendix/calendar-web**) into a Mendix **Module** package (for example, **@mendix/calendar**). The resulting module bundles pages, domain model, microflows and the widget itself. The steps below align with the automation scripts located in `automation/utils` within this repository.

---

## 1. Terminology

| Term                | Purpose                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| _Widget package_    | `.mpk` produced by Rollup in `packages/pluggableWidgets/<name>-web`; contains only `<clientModule>` (JavaScript, XML, SCSS). |
| _Module package_    | `.mpk` exported by Studio Pro; contains `<module>` (pages, microflows, domain model **plus** embedded widget mpk).           |
| **Authoring app**   | Your working project where you design the pages/microflows for the module.                                                   |
| **Host / test app** | A minimal blank project used by CI to (re)export the module; committed to `mendix/testProjects` repo.                        |

---

## 2. Prerequisites

- Node + `pnpm install` executed in the mono-repo.
- **@mendix/_widget_-web** already builds (`pnpm run build`).
- GitHub Personal-Access Token saved as secret `GH_PAT` for release workflow.

---

## 3. Create / Export the Module in Studio Pro

1. **Authoring app**: make sure everything lives inside one module (e.g. _Calendar_).
2. Right–click that module → _Export module package…_ → save `Calendar.mpk`.
   _This file contains pages, flows, entities and the widget placeholder._

---

## 4. Prepare the Host Test Project

1. Start a **Blank App** in Studio Pro (or `mx create-project`).
2. _App → Import module package…_ and select the `Calendar.mpk` from step 3.
3. Optional: add a navigation item to a Calendar page so the app runs out-of-box.
4. Close Studio Pro.
5. In terminal:
    ```bash
    cd <project-folder>
    git init
    git switch -c calendar-web              # branch must match package.json
    git remote add origin https://github.com/mendix/testProjects.git
    echo "/deployment/\n/theme-cache/" > .gitignore
    git add .
    git commit -m "Initial Calendar host project"
    git push -u origin calendar-web         # or pull –rebase first if branch exists
    ```

---

## 5. Scaffold the Module Package in the Mono-repo

```
packages/modules/calendar/
 ├─ package.json          ← see template below
 ├─ CHANGELOG.md
 ├─ LICENSE               ← Apache 2.0 copy
 ├─ .prettierrc.js
 └─ scripts/
     ├─ build.ts
     ├─ push-update.ts
     ├─ release.ts
     └─ tsconfig.json
```

### `package.json` highlights

```jsonc
{
    "name": "@mendix/calendar",
    "mxpackage": {
        "type": "module",
        "name": "Calendar",
        "mpkName": "Calendar.mpk",
        "dependencies": ["@mendix/calendar-web"]
    },
    "moduleFolderNameInModeler": "calendar", // themesource/javascriptsource
    "testProject": {
        "githubUrl": "https://github.com/mendix/testProjects",
        "branchName": "calendar-web"
    },
    "scripts": {
        "build:module": "ts-node --project scripts/tsconfig.json scripts/build.ts",
        "release:module": "ts-node --project scripts/tsconfig.json scripts/release.ts"
    }
}
```

Scripts are copied from `packages/modules/file-uploader/scripts/`.

---

## 6. Local Verification

```bash
# build the widget first
pnpm --filter @mendix/calendar-web run build

#   Option A: point to a running Studio Pro project
export MX_PROJECT_PATH="$HOME/Mendix/CalendarHost"

#   Option B: rely on tests/testProject folder
# (create it or let cloneTestProject do it in release script)

pnpm --filter @mendix/calendar run build:module
```

The command clones (or uses `MX_PROJECT_PATH`) and copies `com.mendix.widget.web.calendar.mpk` into `widgets/`. Open the project in Studio Pro and run.

---

## 7. Produce the Distributable MPK

```bash
pnpm --filter @mendix/calendar run release:module
```

Pipeline steps (see `automation/utils/src/steps.ts`):

1. `removeDist`  clean old output
2. `cloneTestProject` clone branch `calendar-web`
3. `writeModuleVersion` / `copyModuleLicense`
4. `copyWidgetsToProject` add fresh widget mpk
5. `createModuleMpk` export Calendar module via _mxbuild_
6. `addWidgetsToMpk` embed widget MPK in module MPK
7. `moveModuleToDist` place under `dist/<version>/Calendar.mpk`

Upload the resulting MPK to the Mendix Marketplace.

---

## 8. CI / GitHub Actions

• `.github/workflows/CreateGitHubRelease.yml` uses `${{ secrets.GH_PAT }}` to create a release and attach the MPK asset. Set that PAT in _Repo → Settings → Secrets → Actions_.

---

## 9. Quick Checklist

✔ Authoring module exported → `Calendar.mpk`
✔ Host project committed to `testProjects` (`calendar-web` branch)
✔ `@mendix/calendar` module package with correct metadata & scripts
✔ Local `build:module` works
✔ `release:module` produces `dist/Calendar.mpk`

You now have a fully-packaged module ready for Marketplace users to drag-and-drop without extra configuration.
