---
name: release-widget
description: Use when releasing a standalone Mendix widget or module from the web-widgets monorepo — version bump through Marketplace publish. Guides module-vs-standalone detection, prereqs, changelog-driven version selection, and drives the release pipeline directly (git/gh/pnpm) instead of a manual wizard.
---

# Release Widget

## Overview

Releases a widget (or the module wrapping it): version bump → GitHub draft release → OSS clearance → Marketplace publish.

**Autonomy carve-out (this skill only):** pre-authorized to run `git push`, `gh workflow run`, and `gh release edit --draft=false` (publish) directly without per-step confirmation. Does **not** extend to rollback (deleting releases/tags/branches) or merging PRs (branch protection needs team approvals — user's job).

**No persisted release-state file** — each invocation re-checks git/GitHub/Jira/Marketplace from scratch. Safe to stop and resume across sessions.

## Prerequisites

Ask only if not already known:

1. **Package name** — widget or module to release, e.g. `combobox-web` or `data-widgets`. If not given, ask: "Which widget or module are you releasing?"

Everything else — check automatically in Phase 0, don't ask.

## Workflow

### Phase 0 — Detect release target

```bash
cd packages/pluggableWidgets/<widget>
pnpm exec rui-package-info
```

Prints `{"name", "version", "appNumber", "appName"}`. Reads `process.cwd()` — always `cd` into the widget/module dir first, never pass a path argument.

`appName` is the Marketplace display name (e.g. `Maps`). Draft release is titled `<appName> v<version>`.

- `appNumber` positive → **standalone release**. Keep this `info` — Phase 2/3 reuse `<npm-package-name>` from it, Phase 7 reuses `appNumber`.
- `appNumber` is `null`/absent/`-1` → widget is wrapped by another package. Find the owner (usually a module, but a widget like `charts-web` also wraps sub-widgets e.g. `area-chart-web`):
    ```bash
    grep -l "\"@mendix/<widget>\"" packages/modules/*/package.json packages/pluggableWidgets/*/package.json
    ```
    No owner found → stop, package is misconfigured. Otherwise re-run from the owner's directory:
    ```bash
    cd packages/modules/<owner>   # or packages/pluggableWidgets/<owner>
    pnpm exec rui-package-info
    ```
    Owner's `info` is the release target from here on. Tell the user which module or widget wraps it.

Placeholders used below, derived from the release target's `info`:

- `<npm-package-name>` — `info.name` (e.g. `@mendix/data-widgets`). Pass to `rui-changelog`, `rui-bump-version`, `CreateGitHubRelease.yml`'s `package` input.
- `<widget-or-module>` — `<npm-package-name>` minus `@mendix/` prefix, not a folder name. Used in commit messages, branch names, tags.
- `<release-tag>` — `<widget-or-module>-v<version>`, assembled once Phase 2 confirms `<version>`. Used as GitHub release tag, `tmp/<release-tag>` branch, and Jira version.

### Phase 1 — Prerequisite check

Run once, report all results together (don't ask one at a time):

```bash
echo "== SBOM jar =="; ls "${SBOM_GENERATOR_JAR:-$HOME/SBOM_Generator.jar}" 2>&1
echo "== gh auth =="; gh auth status 2>&1
echo "== git branch/status =="; git branch --show-current; git status --short
echo "== main sync =="; git fetch origin main --quiet
echo "behind: $(git rev-list HEAD..origin/main --count)"; echo "ahead: $(git rev-list origin/main..HEAD --count)"
```

If not on `main` or not in sync — fix it yourself (`git checkout main`, `git merge --ff-only origin/main`), unless `main` has diverged from `origin/main` (both `behind` and `ahead` non-zero) — stop and ask.

If the SBOM jar is missing, say what's missing and how to fix it (where to get `SBOM_Generator.jar`, or point `SBOM_GENERATOR_JAR` at it) — don't proceed.

### Phase 2 — Version selection

Current version already known from Phase 0 — don't re-run `rui-package-info`.

```bash
pnpm exec rui-changelog <npm-package-name>
```

Prints `{"hasUnreleasedLogs", "sections", "subcomponents"}`.

- **Widget**: content in `sections`, `subcomponents` empty.
- **Module**: unreleased work usually sits in each wrapped widget's CHANGELOG.md, surfaced as `subcomponents[].sections`. Read those too — a module with `sections: []` is not "nothing to release". `hasUnreleasedLogs` accounts for both.

Summarize unreleased entries by type (Fixed/Added/Changed/Breaking changes), across subcomponents for a module (name the widget each entry came from), and propose a semver bump:

- Any "Breaking changes" section present → propose **major**, but flag it as a recommendation, not a mandate.
- Only "Added" → propose **minor**.
- Only "Fixed" → propose **patch**.

Show the concrete `<version>`, not just the bump-type word — e.g. "propose **minor**: 2.9.0 → 2.10.0". Always ask the user to confirm or override it. If their choice contradicts the changelog (patch despite breaking changes), flag it once, then respect it.

### Phase 3 — Version bump + release branch (autonomous)

Bump to the `<version>` confirmed in Phase 2:

```bash
pnpm exec rui-bump-version <npm-package-name> <version>
```

Prints `{"previousVersion", "version", "bumpedPackages", "changedPaths"}`.

Refuses to run, exits non-zero when:

- `<npm-package-name>` isn't independently releasable (no positive `marketplace.appNumber`) — go back to Phase 0.
- argument isn't a valid `x.y.z` version.
- resulting version isn't greater than `previousVersion`.

**If target wraps other packages (module, or widget like `charts-web` with sub-widgets), this bumps every wrapped dependency to the same version** — all of them, since they ship inside the same MPK. Use `changedPaths` verbatim in the `git add` below.

Then:

```bash
git checkout -b tmp/<release-tag>
git add <changedPaths from the rui-bump-version output above>
git commit -m "chore(<widget-or-module>): bump version to <version>"
git push -u origin tmp/<release-tag>
```

If the branch already exists locally or on remote, stop and ask.

**Jira version** — safe to re-run, always exits 0:

```bash
pnpm exec rui-create-jira-version "<release-tag>"
```

Prints `{"status": "created"|"exists"|"skipped", ...}`. `skipped` covers missing `JIRA_API_TOKEN` or a failed API call — not a blocker either way.

Trigger the GitHub release workflow:

```bash
gh workflow run "CreateGitHubRelease.yml" --ref "tmp/<release-tag>" -f package=<npm-package-name>
```

Poll for completion:

```bash
gh run list --workflow="CreateGitHubRelease.yml" --branch "tmp/<release-tag>" -L 1 --json databaseId,status,conclusion
gh run view <databaseId> --json status,conclusion,url
```

Keep `--branch`: without it, `-L 1` returns the newest run on _any_ branch.

Wait (re-poll, don't ask the user to check) until `status == completed`. Report the conclusion and the draft release URL.

### Phase 4 — OSS clearance SBOM (autonomous prep, manual submission)

```bash
pnpm exec rui-generate-oss-sbom "<release-tag>"
```

Prints `{"path": "<zip path>", "mpk": "<mpk asset name>", "sha256": "<hash>"}`. Generator jar defaults to `~/SBOM_Generator.jar`; override with `SBOM_GENERATOR_JAR` if elsewhere.

Zip is named `<appName> v<version> [<sha256 of the MPK>].zip` — don't rename it. Works on the **draft** release, no publishing needed first.

**Submission is manual** — goes through the OSS clearance portal (Mendix app, Mendix credentials login), not email. Tell the user:

- Zip is ready at the printed path.
- Ask them to submit it via the OSS clearance portal (they know the URL/login flow).
- Draft the request content (widget/module name, version, draft release URL, one-line summary of changes from the changelog) so they can paste it into the portal.

Then ask: "Submitted? Waiting on OSS team reply (a READMEOSS HTML file)." Wait is unbounded (days) — skill can be safely re-invoked later; Phase 0–4 confirm state unchanged and skip straight back here.

### Phase 5 — Include OSS Readme (autonomous once file is provided)

```bash
pnpm exec rui-upload-readme-oss "<release-tag>"
```

Prints `{"uploaded": "<asset name>", "status": "created"|"exists"}`. `exists` = already attached, safe to re-run (GitHub rejects duplicate asset name with 422 otherwise). If no match found, ask the user where the file was saved and pass as 2nd arg: `rui-upload-readme-oss "<release-tag>" "<explicit path>"`.

### Phase 6 — Asset gate + publish (GATE — do not skip)

**Before ever publishing, verify both assets are present:**

```bash
gh release view <release-tag> --json assets --jq '.assets[].name'
```

Require: exactly one `.mpk` file AND one `*READMEOSS*.html` file. If either is missing, **refuse to publish** and tell the user what's missing. If user explicitly says to publish anyway, comply but state clearly this is unverified (no asset-gate passed).

Once the gate passes, publish:

```bash
gh release edit <release-tag> --draft=false
```

Publishing triggers `PublishMarketplace.yml` automatically (on `release: published`). Don't manually re-run the marketplace-publish workflow for the same tag unless the automatic run failed — see Phase 7.

### Phase 7 — Marketplace publish verification

```bash
gh run list --workflow="Publishes a package to marketplace" -L 5 --json databaseId,status,conclusion,headBranch,createdAt
```

Find the run matching this tag/branch.

- `conclusion: success` → doesn't mean the version is live yet. Confirm: `marketplace-mcp`'s `get_content_versions` with `contentId` = `appNumber` from Phase 0, check `<version>` is listed. If `marketplace-mcp` isn't connected or errors, ask the user to check the widget's Marketplace listing page for `<version>`. Don't declare done until one of the two confirms it.

    Then verify changelog PR merged:

    ```bash
    gh pr list --head "tmp/<release-tag>" --json number,state
    ```

    Still open after successful publish → check whether `merge-changelogs-pr` step ran. Don't merge it yourself: branch protection requires team approvals — tell the user it's on them.

- `conclusion: failure` → **check run history before escalating**:
    ```bash
    gh run view <databaseId> --log-failed | grep -A3 "Response status Code"
    ```
    If `409` on `POST .../packages/<appNumber>/versions`:
    1. Check whether an **earlier run for this exact tag already succeeded**: `gh run list --workflow="Publishes a package to marketplace" --json databaseId,status,conclusion,createdAt,headBranch` filtered to this tag. If yes, the 409 means **version already published** — report that, don't escalate/retry/teardown.
    2. If no prior success: check for two runs created seconds apart for the same tag (double-trigger). Otherwise stuck server-side state.
    3. Escalate: report appNumber, tag, endpoint, error, ask whether to (a) dig through logs together and check Marketplace → package page → Manage Versions for a stuck draft, or (b) retry.
    4. Never `gh run rerun` speculatively. Rerun once, only after user confirms they acted (deleted a draft, etc.).

### Phase 8 — Rollback (human-gated, always — carve-out does not apply here)

If the user wants to undo a release attempt, list the exact teardown commands and **wait for explicit confirmation before running any of them**.

```bash
gh release view <release-tag> --json tagName,isDraft,isPrerelease   # confirm current state first
gh pr list --head "tmp/<release-tag>" --json number,url,state
```

Teardown list (present all, confirm once, then execute):

1. `gh release delete <release-tag> --yes` (only if it exists)
2. `git push origin --delete <release-tag>` (remote tag)
3. `git push origin --delete tmp/<release-tag>` (auto-closes any open PR)
4. Jira version: cannot be deleted via available tooling — tell the user to check `<release-tag>` in Jira manually.
5. Marketplace: if a draft/version was created there, that's manual — tell the user to check.

## Common Mistakes

- **Writing inline `ts-node -e` scripts instead of using the packaged CLI helpers** — use `rui-package-info`, `rui-changelog`, `rui-bump-version`, `rui-create-jira-version`, `rui-generate-oss-sbom`, `rui-upload-readme-oss` (in `automation/utils/bin/`). Never reimplement ad hoc.
- **Working around a helper's refusal instead of fixing the input** — go back to Phase 0/2, don't bump the widget by hand.
- **Publishing before the asset gate passes** — never `gh release edit --draft=false` without confirming both MPK and READMEOSS are attached.
- **Escalating a 409 without checking run history first** — check `gh run list` for the tag first.
- **Running rollback commands without explicit go-ahead** — list, then wait.
