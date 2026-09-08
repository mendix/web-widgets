---
name: release-widget
description: Use when releasing a standalone Mendix widget or module from the web-widgets monorepo — version bump through Marketplace publish. Guides module-vs-standalone detection, prereqs, changelog-driven version selection, and drives the release pipeline directly (git/gh/pnpm) instead of a manual wizard.
---

# Release Widget

## Overview

Releases a widget (or the module wrapping it) from this monorepo: version bump → GitHub draft release → OSS clearance → Marketplace publish.

**Autonomy carve-out (this skill only):** unlike the repo's default stance of never pushing/publishing without asking, this skill is pre-authorized to run `git push`, `gh workflow run`, `gh pr merge`, and `gh release edit --draft=false` (publish) directly, without pausing for confirmation on each one — because a human already invoked this skill specifically to run a release. This does **not** extend to destructive rollback (deleting releases/tags/branches) or anything outside this skill's scope.

**State is re-derived every run.** There is no persisted release-state file. Each invocation re-checks git/GitHub/Jira/Marketplace reality from scratch — safe to stop and resume this skill across sessions (e.g. while waiting days for OSS clearance).

## Prerequisites

Ask only if not already known:

1. **Package name** — the widget or module to release, e.g. `combobox-web` or `data-widgets`. If not given, ask: "Which widget or module are you releasing?"

Everything else (module detection, environment prereqs, version state) — check automatically in Phase 0, don't ask.

## Workflow

### Phase 0 — Detect release target

Read the widget's marketplace info via the packaged CLI helper (don't grep — the schema is the source of truth):

```bash
cd packages/pluggableWidgets/<widget>
pnpm exec rui-package-info
```

Prints `{"name", "version", "appNumber", "appName"}`. It reads `process.cwd()` — always `cd` into the widget/module dir first, never pass a path argument. Keep this `info` around — Phase 2 and 3 reuse it, no need to re-fetch.

- `appNumber` is a positive number → **standalone release** (a widget, or a module that is itself published directly). `$RELEASE_PATH` = the directory you just `cd`-ed into — `packages/pluggableWidgets/<widget>` or `packages/modules/<module>`.
- `appNumber` is `null`/absent/`-1` → widget is module-wrapped, not published on its own. Find the owning module:
    ```bash
    grep -l "\"@mendix/<widget>\"" packages/modules/*/package.json
    ```
    That module's directory is `$RELEASE_PATH`. Tell the user which module wraps it. If no module found, stop — this is a misconfigured package, not something to guess through.

Three placeholders recur through the rest of this skill, all derived once here from `$RELEASE_PATH`/`info` — never guessed, never reconstructed later:

- `<widget-or-module>` — the folder name of `$RELEASE_PATH` (e.g. `combobox-web`, `data-widgets`). Used in commit messages.
- `<npm-package-name>` — `info.name` (e.g. `@mendix/combobox-web`). Used only for the `CreateGitHubRelease.yml` workflow's `package` input, which specifically wants the literal `package.json` `name` field, not the folder name.
- `<release-tag>` — `<widget-or-module>` + `-v` + `<version>`, assembled once `<version>` is confirmed in Phase 2. This is the single identifier for the release: the GitHub release tag, the `tmp/<release-tag>` branch name, and the Jira version string all reuse it verbatim.

There's no `<AppName>` placeholder to track — the draft release's title is always `"<AppName> v<version>"` (set by `rui-create-gh-release`'s workflow), so Phase 4/5 read it straight off the release itself instead of carrying it from here.

### Phase 1 — Prerequisite check

Run once, report all results together (don't ask one at a time):

```bash
echo "== SBOM jar =="; ls ~/SBOM_Generator.jar 2>&1
echo "== gh auth =="; gh auth status 2>&1
echo "== git branch/status =="; git branch --show-current; git status --short
echo "== main sync =="; git fetch origin main --quiet; git rev-list HEAD..origin/main --count; git rev-list origin/main..HEAD --count
```

If not on `main` or not in sync — fix it yourself (`git checkout main`, `git merge --ff-only origin/main`) rather than asking, unless `main` has diverged from `origin/main` (both ahead and behind) — that needs a human decision, stop and ask.

If the SBOM jar is missing, tell the user exactly what's missing and how to fix it (where to get `SBOM_Generator.jar`) — don't proceed past a missing prereq. A missing `commitlint` binary is a local `pnpm install` issue, not something this skill gates on — if `git commit` in Phase 3 fails because of it, surface that error when it happens rather than pre-checking for it.

### Phase 2 — Version selection

Read the unreleased changelog using the packaged CLI helper (not raw `sed`/`grep` — it wraps the repo's real changelog parser). Current version is already known from Phase 0's `rui-package-info` output — don't re-run it:

```bash
cd $RELEASE_PATH
pnpm exec rui-changelog
```

`rui-changelog` prints `{"hasUnreleasedLogs", "sections", "subcomponents"}` — parsed directly from `CHANGELOG.md` via the changelog-parser module, so it correctly stops at the unreleased section boundary and reflects module subcomponents. For a module, `subcomponents` is which wrapped widgets have unreleased entries — informational here; Phase 3's `rui-bump-version` re-derives the same thing itself, no need to pass it along.

Summarize the unreleased entries by type (Fixed/Added/Changed/Breaking changes) and propose a semver bump:

- Any "Breaking changes" section present → propose **major**, but flag it as a recommendation, not a mandate.
- Only "Added" → propose **minor**.
- Only "Fixed" → propose **patch**.

Compute the concrete `<version>` this bump produces (current version from Phase 0 + bump type) and show it, not just the bump-type word — e.g. "propose **minor**: 2.9.0 → 2.10.0". Ask the user to confirm or override that `<version>` — this is the one decision in the pipeline that's inherently a judgment call, always ask. If the user picks something inconsistent with changelog content (e.g. patch despite a breaking-changes note), flag the mismatch once, then respect their choice. The `<version>` confirmed here is final — Phase 3 bumps to it directly, it is not recomputed later.

### Phase 3 — Version bump + release branch (autonomous)

Bump to the `<version>` confirmed in Phase 2, using the packaged CLI helper — it wraps the repo's real version-math code. Pass the explicit version, not the bump-type word — the word was only needed to _propose_ `<version>` in Phase 2, it's a resolved value by now:

```bash
cd $RELEASE_PATH
pnpm exec rui-bump-version <version>
```

Prints `{"previousVersion", "version", "xmlBumped", "bumpedPackages", "changedPaths"}`. `xmlBumped: false` is expected for modules (no `package.xml`) — not an error. **For a module release, this already bumps every wrapped widget that has unreleased changelog entries** — the script walks the module's own `mxpackage.dependencies` and checks each wrapped widget's changelog itself; there's no separate loop to run here. `bumpedPackages`/`changedPaths` list everything actually touched (the module/widget itself, plus any wrapped widgets bumped alongside it for a module release) — use `changedPaths` directly in the `git add` below rather than reconstructing the list.

Then, directly (no wizard):

```bash
git checkout -b tmp/<release-tag>
git add <changedPaths from the rui-bump-version output above>
git commit -m "chore(<widget-or-module>): bump version to <version>"
git push -u origin tmp/<release-tag>
```

If the branch already exists locally or on remote, stop and ask — don't guess a random suffix, that was a wizard fallback for unattended use, not something to do silently on someone's behalf.

**Jira version** — the CLI checks for an existing version before creating one (safe to re-run) and always exits 0, reporting status via JSON rather than blocking the release:

```bash
pnpm exec rui-create-jira-version "<release-tag>"
```

Prints `{"status": "created"|"exists"|"skipped", ...}`. `skipped` covers both a missing `JIRA_API_TOKEN` and a failed API call (this has historically 404'd transiently) — not a blocker either way.

Trigger the GitHub release workflow directly, passing `<npm-package-name>` as defined in Phase 0 (`info.name`, e.g. `@mendix/combobox-web` — the workflow's `package` input wants the literal `package.json` name, not `<widget-or-module>`):

```bash
gh workflow run "CreateGitHubRelease.yml" --ref "tmp/<release-tag>" -f package=<npm-package-name>
```

Poll for completion:

```bash
gh run list --workflow="CreateGitHubRelease.yml" -L 1 --json databaseId,status,conclusion
gh run view <databaseId> --json status,conclusion,url
```

Wait (re-poll, don't ask the user to check) until `status == completed`. Report the conclusion and the draft release URL.

### Phase 4 — OSS clearance SBOM (autonomous prep, manual submission)

Read the draft release's title — it's always `"<AppName> v<version>"` (e.g. `"Combo box v2.9.0"`), so this is the one place that string comes from, never re-typed or guessed:

```bash
gh release view "<release-tag>" --json name --jq .name
```

Download the MPK from the draft release and generate the SBOM zip via the packaged CLI helper — don't use the interactive `oss-clearance` wizard:

```bash
pnpm exec rui-generate-oss-sbom "<release-tag>" "<release-title-from-above>"
```

Prints `{"path": "<zip path>"}`. The generator jar defaults to `~/SBOM_Generator.jar`; override with `SBOM_GENERATOR_JAR` if it lives elsewhere.

**Submission is manual** — the OSS clearance request now goes through the OSS clearance portal (a Mendix app, log in with Mendix credentials), not email. Tell the user:

- The zip is ready at the printed path.
- Ask them to submit it via the OSS clearance portal (they know the URL/login flow; don't guess or fetch a URL for this).
- Draft the request content (widget/module name, version, draft release URL, one-line summary of changes from the changelog) so they can paste it into the portal.

Then ask: "Submitted? Waiting on OSS team reply (a READMEOSS HTML file)." This wait is inherently unbounded (days) — the skill can be safely re-invoked later; Phase 0–4 will just confirm state is unchanged and skip straight back here.

### Phase 5 — Include OSS Readme (autonomous once file is provided)

Once the user has the READMEOSS HTML file, upload it via the packaged CLI helper (default search locations are `~/Downloads` and `~/Documents`), reusing the same release-title lookup from Phase 4:

```bash
pnpm exec rui-upload-readme-oss "<release-tag>" "<release-title-from-phase-4>"
```

Prints `{"uploaded": "<asset name>"}`. If it errors with no match found, ask the user where the file was saved and pass that path as a 3rd argument: `rui-upload-readme-oss "<release-tag>" "<release-title-from-phase-4>" "<explicit path>"`.

### Phase 6 — Asset gate + publish (GATE — do not skip)

**Before ever publishing, verify both assets are present:**

```bash
gh release view <release-tag> --json assets --jq '.assets[].name'
```

Require: exactly one `.mpk` file AND one `*READMEOSS*.html` file. If either is missing, **refuse to publish** and tell the user what's missing. If the user explicitly says to publish anyway, comply but state clearly that this is an unverified publish (no asset-gate passed).

Once the gate passes, publish directly (carve-out applies — this is a forward release action):

```bash
gh release edit <release-tag> --draft=false
```

Publishing triggers `PublishMarketplace.yml` automatically (on `release: published`). Do not also manually re-run the marketplace-publish workflow for the same tag unless the automatic run actually failed — see Phase 7 for how to tell the difference.

### Phase 7 — Marketplace publish verification

```bash
gh run list --workflow="Publishes a package to marketplace" -L 5 --json databaseId,status,conclusion,headBranch,createdAt
```

Find the run matching this tag/branch.

- `conclusion: success` → the workflow succeeded, but that only means the API call didn't error — it's not proof the version is live. `createDraft`/`publishDraft` are write-only (no idempotency or read-back check), so confirm with a read: call the `marketplace-mcp` MCP server's `get_content_versions` tool with `contentId` = `appNumber` (from Phase 0's `rui-package-info` output), and check `<version>` appears among the returned versions. If `marketplace-mcp` isn't connected (e.g. missing `MARKETPLACE_API_TOKEN`) or the call errors, fall back to asking the user to open Marketplace → package page → Manage Versions and check manually. Don't declare the release done until one of these two confirms it.

    Once confirmed, merge the changelog PR (this repo's automation should trigger this, but verify):

    ```bash
    gh pr list --head "tmp/<release-tag>" --json number,state
    ```

    If still open and unmerged after a successful publish, that's unexpected — check whether the workflow's own `merge-changelogs-pr` step ran, don't just merge it yourself without checking why it didn't auto-merge.

- `conclusion: failure` → **before assuming stuck-draft or escalating, check history first**:
    ```bash
    gh run view <databaseId> --log-failed | grep -A3 "Response status Code"
    ```
    If it's a `409` on `POST .../packages/<appNumber>/versions`:
    1. Check whether an **earlier run for this exact tag already succeeded**: `gh run list --workflow="Publishes a package to marketplace" --json databaseId,status,conclusion,createdAt,headBranch` filtered to this tag. If a prior run for the same tag succeeded, the 409 on this run means **the version is already published** — not a real failure. Report that, don't escalate, don't retry, don't teardown.
    2. If no prior success exists for this tag: this is the same failure mode from the last incident (real backend conflict, not caused by our script — `createDraft()` has no idempotency check, so a 409 here is either a genuine stuck server-side state or a double-trigger — check `gh run list` for more than one run created within seconds of each other for the same tag, which would indicate a double-trigger).
    3. Only after ruling out (1) and confirming a real conflict: this is an exceptional situation, don't act unilaterally — report the exact escalation details (appNumber, tag, endpoint, error) and ask the user which way to go: (a) dig further into the failed run's logs together (e.g. check the Marketplace UI for stuck drafts — navigation: Marketplace → package page → Manage Versions → search version), or (b) if they know something was just fixed/changed on the Marketplace side, retry now. Don't pick a direction yourself.
    4. Do not blindly `gh run rerun` more than once without new information — 3 identical reruns with no state change, as happened previously, wastes time. Rerun once after the user confirms they've taken an action (deleted a draft, etc.), not speculatively.

### Phase 8 — Rollback (human-gated, always — carve-out does not apply here)

If the user wants to undo a release attempt, list the exact teardown commands and **wait for explicit confirmation before running any of them**, regardless of how far the carve-out extends elsewhere in this skill:

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

- **Writing inline `ts-node -e` scripts instead of using the packaged CLI helpers** — `rui-package-info`, `rui-bump-version`, `rui-create-jira-version`, `rui-generate-oss-sbom`, and `rui-upload-readme-oss` (in `automation/utils/bin/`) already wrap all the release-pipeline logic this skill needs. Never reimplement that logic in an ad-hoc script.
- **Running `rui-package-info` / `rui-bump-version` without `cd`-ing into the widget/module dir first** — they read `process.cwd()`, not a path argument.
- **Treating `appNumber` presence via grep instead of reading the schema** — a module-wrapped widget's package.json simply omits the `marketplace.appNumber` key; check for `null`/undefined/`-1` via `rui-package-info`, don't grep for the string `"appNumber"` (unreliable — the field can exist with value `-1` too, which also means "not independently published").
- **Publishing before the asset gate passes** — this is the exact mistake pattern that caused the 409 double-trigger risk. Never call `gh release edit --draft=false` without first confirming both MPK and READMEOSS assets are attached.
- **Escalating a 409 without checking run history first** — `PublishMarketplace.yml` fires automatically on `release: published` (Phase 6), but nothing stops a human from also manually re-running it for the same tag (e.g. impatience, or thinking it silently failed) while the automatic run is still in flight or already succeeded. The second run then hits a package that's already published and 409s — a real HTTP error, but not a real incident. Always check `gh run list` history for the tag before treating a 409 as a real incident.
- **Retrying `gh run rerun` speculatively** — reruns without new information (e.g., a deleted draft) just reproduce the same failure. Only rerun after the user confirms they changed something.
- **Running rollback commands without the explicit go-ahead** — this is the one phase where the autonomy carve-out does not apply. Always list and wait for confirmation.

## Reference Files

None yet — this skill is new (rebuilt from lost prior version + 2026-07 incident history) and running in a private trial (`.agents/skills/`, untracked) before being proposed for the shared skill set. If patterns emerge from real runs (new failure modes, widget-specific quirks), add them here rather than growing the phases above indefinitely.
