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

1. **Widget name** — e.g. `combobox-web`. If not given, ask: "Which widget are you releasing?"

Everything else (module detection, environment prereqs, version state) — check automatically in Phase 0, don't ask.

## Workflow

### Phase 0 — Detect release target

Read the widget's marketplace info via the packaged CLI helper (don't grep, don't write an inline script — the schema is the source of truth):

```bash
cd packages/pluggableWidgets/<widget>
pnpm exec rui-package-info
```

Prints `{"name", "version", "appNumber", "appName"}`. It reads `process.cwd()` — always `cd` into the widget/module dir first, never pass a path argument.

- `appNumber` is a positive number → **standalone widget release**. `$RELEASE_PATH = packages/pluggableWidgets/<widget>`.
- `appNumber` is `null`/absent/`-1` → widget is module-wrapped, not published on its own. Find the owning module:
    ```bash
    grep -l "\"@mendix/<widget>\"" packages/modules/*/package.json
    ```
    That module's directory is `$RELEASE_PATH`. Tell the user which module wraps it. If no module found, stop — this is a misconfigured package, not something to guess through.

### Phase 1 — Prerequisite check

Run once, report all results together (don't ask one at a time):

```bash
echo "== SBOM jar =="; ls ~/SBOM_Generator.jar 2>&1
echo "== gh auth =="; gh auth status 2>&1
echo "== JIRA token =="; [[ -n "$JIRA_API_TOKEN" ]] && echo set || echo missing
echo "== commitlint =="; ls node_modules/.bin/commitlint 2>/dev/null || echo missing
echo "== git branch/status =="; git branch --show-current; git status --short
echo "== main sync =="; git fetch origin main --quiet; git rev-list HEAD..origin/main --count; git rev-list origin/main..HEAD --count
```

If not on `main` or not in sync — fix it yourself (`git checkout main`, `git merge --ff-only origin/main`) rather than asking, unless `main` has diverged from `origin/main` (both ahead and behind) — that needs a human decision, stop and ask.

If commitlint or the SBOM jar is missing, tell the user exactly what's missing and how to fix it (`pnpm install`, or where to get `SBOM_Generator.jar`) — don't proceed past a missing prereq.

### Phase 2 — Version selection

Read the unreleased changelog and current version:

```bash
sed -n '/## \[Unreleased\]/,/## \[/p' $RELEASE_PATH/CHANGELOG.md | head -40
grep '"version"' $RELEASE_PATH/package.json | head -1
```

Summarize the unreleased entries by type (Fixed/Added/Changed/Breaking changes) and propose a semver bump:

- Any "Breaking changes" section present → propose **major**, but flag it as a recommendation, not a mandate.
- Only "Added" → propose **minor**.
- Only "Fixed" → propose **patch**.

Ask the user to confirm or override — this is the one decision in the pipeline that's inherently a judgment call, always ask. If the user picks something inconsistent with changelog content (e.g. patch despite a breaking-changes note), flag the mismatch once, then respect their choice.

### Phase 3 — Version bump + release branch (autonomous)

Compute the next version and bump both files using the packaged CLI helper (not an inline script — it wraps the repo's real version-math code):

```bash
cd $RELEASE_PATH
pnpm exec rui-bump-version <patch|minor|major>
```

Prints `{"previousVersion", "version", "xmlBumped"}`. `xmlBumped: false` is expected for modules (no `package.xml`) — not an error.

Then, directly (no wizard):

```bash
git checkout -b tmp/<widget-or-module>-v<version>
git add $RELEASE_PATH
git commit -m "chore(<widget-or-module>): bump version to <version>"
git push -u origin tmp/<widget-or-module>-v<version>
```

If the branch already exists locally or on remote, stop and ask — don't guess a random suffix, that was a wizard fallback for unattended use, not something to do silently on someone's behalf.

**Jira version** — the CLI checks for an existing version before creating one (safe to re-run) and always exits 0, reporting status via JSON rather than blocking the release:

```bash
pnpm exec rui-create-jira-version "<widget-or-module>-v<version>"
```

Prints `{"status": "created"|"exists"|"skipped", ...}`. `skipped` covers both a missing `JIRA_API_TOKEN` and a failed API call (this has historically 404'd transiently) — not a blocker either way.

Trigger the GitHub release workflow directly:

```bash
gh workflow run "CreateGitHubRelease.yml" --ref "tmp/<widget-or-module>-v<version>" -f package=<npm-package-name>
```

Poll for completion:

```bash
gh run list --workflow="CreateGitHubRelease.yml" -L 1 --json databaseId,status,conclusion
gh run view <databaseId> --json status,conclusion,url
```

Wait (re-poll, don't ask the user to check) until `status == completed`. Report the conclusion and the draft release URL.

### Phase 4 — OSS clearance SBOM (autonomous prep, manual submission)

Download the MPK from the draft release and generate the SBOM zip via the packaged CLI helper — don't use the interactive `oss-clearance` wizard, and don't write an inline script:

```bash
pnpm exec rui-generate-oss-sbom "<widget-or-module>-v<version>" "<AppName> v<version>"
```

(`<AppName> v<version>` e.g. `"Combo box v2.9.0"`.) Prints `{"path": "<zip path>"}`. The generator jar defaults to `~/SBOM_Generator.jar`; override with `SBOM_GENERATOR_JAR` if it lives elsewhere.

**Submission is manual** — the OSS clearance request now goes through the OSS clearance portal (a Mendix app, log in with Mendix credentials), not email. Tell the user:

- The zip is ready at the printed path.
- Ask them to submit it via the OSS clearance portal (they know the URL/login flow; don't guess or fetch a URL for this).
- Draft the request content (widget/module name, version, draft release URL, one-line summary of changes from the changelog) so they can paste it into the portal.

Then ask: "Submitted? Waiting on OSS team reply (a READMEOSS HTML file)." This wait is inherently unbounded (days) — the skill can be safely re-invoked later; Phase 0–4 will just confirm state is unchanged and skip straight back here.

### Phase 5 — Include OSS Readme (autonomous once file is provided)

Once the user has the READMEOSS HTML file, upload it via the packaged CLI helper (default search locations are `~/Downloads` and `~/Documents`):

```bash
pnpm exec rui-upload-readme-oss "<widget-or-module>-v<version>" "<AppName> v<version>"
```

Prints `{"uploaded": "<asset name>"}`. If it errors with no match found, ask the user where the file was saved and pass that path as a 3rd argument: `rui-upload-readme-oss "<tag>" "<AppName> v<version>" "<explicit path>"`.

### Phase 6 — Asset gate + publish (GATE — do not skip)

**Before ever publishing, verify both assets are present:**

```bash
gh release view <widget-or-module>-v<version> --json assets --jq '.assets[].name'
```

Require: exactly one `.mpk` file AND one `*READMEOSS*.html` file. If either is missing, **refuse to publish** and tell the user what's missing. If the user explicitly says to publish anyway, comply but state clearly that this is an unverified publish (no asset-gate passed).

Once the gate passes, publish directly (carve-out applies — this is a forward release action):

```bash
gh release edit <widget-or-module>-v<version> --draft=false
```

Publishing triggers `PublishMarketplace.yml` automatically (on `release: published`). Do not also manually re-run the marketplace-publish workflow for the same tag unless the automatic run actually failed — see Phase 7 for how to tell the difference.

### Phase 7 — Marketplace publish verification

```bash
gh run list --workflow="Publishes a package to marketplace" -L 5 --json databaseId,status,conclusion,headBranch,createdAt
```

Find the run matching this tag/branch.

- `conclusion: success` → done. Merge the changelog PR (this repo's automation should trigger this, but verify):

    ```bash
    gh pr list --head "tmp/<widget-or-module>-v<version>" --json number,state
    ```

    If still open and unmerged after a successful publish, that's unexpected — check whether the workflow's own `merge-changelogs-pr` step ran, don't just merge it yourself without checking why it didn't auto-merge.

- `conclusion: failure` → **before assuming stuck-draft or escalating, check history first**:
    ```bash
    gh run view <databaseId> --log-failed | grep -A3 "Response status Code"
    ```
    If it's a `409` on `POST .../packages/<appNumber>/versions`:
    1. Check whether an **earlier run for this exact tag already succeeded**: `gh run list --workflow="Publishes a package to marketplace" --json databaseId,status,conclusion,createdAt,headBranch` filtered to this tag. If a prior run for the same tag succeeded, the 409 on this run means **the version is already published** — not a real failure. Report that, don't escalate, don't retry, don't teardown.
    2. If no prior success exists for this tag: this is the same failure mode from the last incident (real backend conflict, not caused by our script — `createDraft()` has no idempotency check, so a 409 here is either a genuine stuck server-side state or a double-trigger — check `gh run list` for more than one run created within seconds of each other for the same tag, which would indicate a double-trigger).
    3. Only after ruling out (1) and confirming a real conflict: report the exact escalation details (appNumber, tag, endpoint, error) and ask the user to check the Marketplace UI for stuck drafts. Marketplace UI actions are manual — give exact navigation steps (Marketplace → package page → Manage Versions → search version → delete draft), the user executes and reports back.
    4. Do not blindly `gh run rerun` more than once without new information — 3 identical reruns with no state change, as happened previously, wastes time. Rerun once after the user confirms they've taken an action (deleted a draft, etc.), not speculatively.

### Phase 8 — Rollback (human-gated, always — carve-out does not apply here)

If the user wants to undo a release attempt, list the exact teardown commands and **wait for explicit confirmation before running any of them**, regardless of how far the carve-out extends elsewhere in this skill:

```bash
gh release view <tag> --json tagName,isDraft,isPrerelease   # confirm current state first
gh pr list --head "tmp/<widget-or-module>-v<version>" --json number,url,state
```

Teardown list (present all, confirm once, then execute):

1. `gh release delete <tag> --yes` (only if it exists)
2. `git push origin --delete <tag>` (remote tag)
3. `git push origin --delete tmp/<widget-or-module>-v<version>` (auto-closes any open PR)
4. Jira version: cannot be deleted via available tooling — tell the user to check `<widget-or-module>-v<version>` in Jira manually.
5. Marketplace: if a draft/version was created there, that's manual — tell the user to check.

## Common Mistakes

- **Writing inline `ts-node -e` scripts instead of using the packaged CLI helpers** — `rui-package-info`, `rui-bump-version`, `rui-create-jira-version`, `rui-generate-oss-sbom`, and `rui-upload-readme-oss` (in `automation/utils/bin/`) already wrap all the release-pipeline logic this skill needs. Never reimplement that logic in an ad-hoc script.
- **Running `rui-package-info` / `rui-bump-version` without `cd`-ing into the widget/module dir first** — they read `process.cwd()`, not a path argument.
- **Treating `appNumber` presence via grep instead of reading the schema** — a module-wrapped widget's package.json simply omits the `marketplace.appNumber` key; check for `null`/undefined/`-1` via `rui-package-info`, don't grep for the string `"appNumber"` (unreliable — the field can exist with value `-1` too, which also means "not independently published").
- **Publishing before the asset gate passes** — this is the exact mistake pattern that caused the 409 double-trigger risk. Never call `gh release edit --draft=false` without first confirming both MPK and READMEOSS assets are attached.
- **Escalating a 409 without checking run history first** — many past "failures" are actually the second of two triggers for an already-successful publish. Always check `gh run list` history for the tag before treating a 409 as a real incident.
- **Retrying `gh run rerun` speculatively** — reruns without new information (e.g., a deleted draft) just reproduce the same failure. Only rerun after the user confirms they changed something.
- **Running rollback commands without the explicit go-ahead** — this is the one phase where the autonomy carve-out does not apply. Always list and wait for confirmation.

## Reference Files

None yet — this skill is new (rebuilt from lost prior version + 2026-07 incident history) and running in a private trial (`.agents/skills/`, untracked) before being proposed for the shared skill set. If patterns emerge from real runs (new failure modes, widget-specific quirks), add them here rather than growing the phases above indefinitely.
