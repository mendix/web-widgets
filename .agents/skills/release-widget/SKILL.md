---
name: release-widget
description: Use when releasing a standalone Mendix widget or module from the web-widgets monorepo — version bump through Marketplace publish. Guides module-vs-standalone detection, prereqs, changelog-driven version selection, and drives the release pipeline directly (git/gh/pnpm) instead of a manual wizard.
---

# Release Widget

## Overview

Releases a widget (or the module wrapping it) from this monorepo: version bump → GitHub draft release → OSS clearance → Marketplace publish.

**Autonomy carve-out (this skill only):** unlike the repo's default stance of never pushing/publishing without asking, this skill is pre-authorized to run `git push`, `gh workflow run`, and `gh release edit --draft=false` (publish) directly, without pausing for confirmation on each one — because a human already invoked this skill specifically to run a release. This does **not** extend to destructive rollback (deleting releases/tags/branches), merging PRs (branch protection requires team approvals — that's on the user to gather), or anything outside this skill's scope.

**State is re-derived every run.** No persisted release-state file: each invocation re-checks git/GitHub/Jira/Marketplace from scratch, so this skill is safe to stop and resume across sessions (e.g. while waiting days for OSS clearance).

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

Prints `{"name", "version", "appNumber", "appName"}`. It reads `process.cwd()` — always `cd` into the widget/module dir first, never pass a path argument.

`appName` is the Marketplace display name (e.g. `Maps`). The draft release is titled `<appName> v<version>`, which is what the OSS helpers match SBOM/READMEOSS filenames against — they derive it from the tag themselves.

- `appNumber` is a positive number → **standalone release** (a widget, or a module published directly). Keep this `info` — Phase 2 and 3 reuse `<npm-package-name>` from it (no re-fetching), and Phase 7 reuses `appNumber` itself.
- `appNumber` is `null`/absent/`-1` → widget is wrapped by another package, not published on its own. Find the owner — it's usually a module, but a widget like `charts-web` also wraps sub-widgets (e.g. `area-chart-web`) directly, so check both locations:
    ```bash
    grep -l "\"@mendix/<widget>\"" packages/modules/*/package.json packages/pluggableWidgets/*/package.json
    ```
    No owner found → stop, the package is misconfigured; don't guess through it. Otherwise re-run from the owner's directory:
    ```bash
    cd packages/modules/<owner>   # or packages/pluggableWidgets/<owner>
    pnpm exec rui-package-info
    ```
    The owner's `info` is the release target from here on; the original widget's was only needed to find it. Tell the user which module or widget wraps it.

Three placeholders recur below, all derived from the release target's `info` — never guessed:

- `<npm-package-name>` — `info.name` (e.g. `@mendix/data-widgets`). Pass to `rui-changelog`, `rui-bump-version`, and `CreateGitHubRelease.yml`'s `package` input.
- `<widget-or-module>` — `<npm-package-name>` minus the `@mendix/` prefix, not a folder name. Used in commit messages, branch names, tags.
- `<release-tag>` — `<widget-or-module>-v<version>`, assembled once Phase 2 confirms `<version>`. Reused verbatim as the GitHub release tag, the `tmp/<release-tag>` branch, and the Jira version.

### Phase 1 — Prerequisite check

Run once, report all results together (don't ask one at a time):

```bash
echo "== SBOM jar =="; ls "${SBOM_GENERATOR_JAR:-$HOME/SBOM_Generator.jar}" 2>&1
echo "== gh auth =="; gh auth status 2>&1
echo "== git branch/status =="; git branch --show-current; git status --short
echo "== main sync =="; git fetch origin main --quiet
echo "behind: $(git rev-list HEAD..origin/main --count)"; echo "ahead: $(git rev-list origin/main..HEAD --count)"
```

If not on `main` or not in sync — fix it yourself (`git checkout main`, `git merge --ff-only origin/main`) rather than asking, unless `main` has diverged from `origin/main` (both `behind` and `ahead` non-zero) — that needs a human decision, stop and ask.

If the SBOM jar is missing, say what's missing and how to fix it (where to get `SBOM_Generator.jar`, or point `SBOM_GENERATOR_JAR` at it) — don't proceed past a missing prereq.

### Phase 2 — Version selection

Read the unreleased changelog using the packaged CLI helper. Current version is already known from Phase 0's `rui-package-info` output — don't re-run it:

```bash
pnpm exec rui-changelog <npm-package-name>
```

`rui-changelog` prints `{"hasUnreleasedLogs", "sections", "subcomponents"}`.

- For a **widget**, the content is in `sections` and `subcomponents` is empty.
- For a **module**, it's usually the other way round: a module's own CHANGELOG.md rarely has module-level unreleased entries — real unreleased work sits in each wrapped widget's own CHANGELOG.md. `rui-changelog` reads those for you and surfaces them as `subcomponents[].sections`. Read those too — a module with `sections: []` is not "nothing to release". `hasUnreleasedLogs` accounts for both.

Summarize the unreleased entries by type (Fixed/Added/Changed/Breaking changes), across subcomponents for a module (name the widget each entry came from), and propose a semver bump:

- Any "Breaking changes" section present → propose **major**, but flag it as a recommendation, not a mandate.
- Only "Added" → propose **minor**.
- Only "Fixed" → propose **patch**.

Show the concrete `<version>`, not just the bump-type word — e.g. "propose **minor**: 2.9.0 → 2.10.0". Always ask the user to confirm or override it; this is the pipeline's one judgment call. If their choice contradicts the changelog (patch despite breaking changes), flag it once, then respect it.

### Phase 3 — Version bump + release branch (autonomous)

Bump to the `<version>` confirmed in Phase 2. The helper only accepts an explicit `x.y.z` version — it has no bump-type shorthand:

```bash
pnpm exec rui-bump-version <npm-package-name> <version>
```

Prints `{"previousVersion", "version", "xmlBumped", "bumpedPackages", "changedPaths"}`. `xmlBumped: false` is expected for modules (no `package.xml`) — not an error.

It refuses to run and exits non-zero when:

- `<npm-package-name>` isn't independently releasable (no positive `marketplace.appNumber`) — Phase 0 pointed at the wrong package, go back and recheck.
- the argument isn't a valid `x.y.z` version.
- the resulting version isn't greater than `previousVersion` (catches a typo'd downgrade or re-bumping an already-bumped package).

**If the target wraps other packages (a module, or a widget like `charts-web` with sub-widgets), this bumps every wrapped dependency to the same version** — all of them, not only those with unreleased changelog entries, since they ship inside the same MPK. Use `changedPaths` verbatim in the `git add` below rather than reconstructing the list.

Then, directly (no wizard):

```bash
git checkout -b tmp/<release-tag>
git add <changedPaths from the rui-bump-version output above>
git commit -m "chore(<widget-or-module>): bump version to <version>"
git push -u origin tmp/<release-tag>
```

If the branch already exists locally or on remote, stop and ask — don't guess a suffix.

**Jira version** — safe to re-run, and always exits 0 so it can't block the release:

```bash
pnpm exec rui-create-jira-version "<release-tag>"
```

Prints `{"status": "created"|"exists"|"skipped", ...}`. `skipped` covers both a missing `JIRA_API_TOKEN` and a failed API call — not a blocker either way.

Trigger the GitHub release workflow directly:

```bash
gh workflow run "CreateGitHubRelease.yml" --ref "tmp/<release-tag>" -f package=<npm-package-name>
```

Poll for completion:

```bash
gh run list --workflow="CreateGitHubRelease.yml" --branch "tmp/<release-tag>" -L 1 --json databaseId,status,conclusion
gh run view <databaseId> --json status,conclusion,url
```

Keep `--branch`: without it, `-L 1` returns the newest run on _any_ branch, so a colleague's concurrent release gets reported as this one.

Wait (re-poll, don't ask the user to check) until `status == completed`. Report the conclusion and the draft release URL.

### Phase 4 — OSS clearance SBOM (autonomous prep, manual submission)

Download the MPK from the draft release and generate the SBOM zip via the packaged CLI helper — don't use the interactive `oss-clearance` wizard:

```bash
pnpm exec rui-generate-oss-sbom "<release-tag>"
```

Prints `{"path": "<zip path>", "mpk": "<mpk asset name>", "sha256": "<hash>"}`. The generator jar defaults to `~/SBOM_Generator.jar`; override with `SBOM_GENERATOR_JAR` if it lives elsewhere.

The zip is named `<appName> v<version> [<sha256 of the MPK>].zip`. The OSS team keys their reply off that name — don't rename it. Works on the **draft** release, so nothing needs publishing first.

**Submission is manual** — the OSS clearance request now goes through the OSS clearance portal (a Mendix app, log in with Mendix credentials), not email. Tell the user:

- The zip is ready at the printed path.
- Ask them to submit it via the OSS clearance portal (they know the URL/login flow; don't guess or fetch a URL for this).
- Draft the request content (widget/module name, version, draft release URL, one-line summary of changes from the changelog) so they can paste it into the portal.

Then ask: "Submitted? Waiting on OSS team reply (a READMEOSS HTML file)." This wait is inherently unbounded (days) — the skill can be safely re-invoked later; Phase 0–4 will just confirm state is unchanged and skip straight back here.

### Phase 5 — Include OSS Readme (autonomous once file is provided)

Once the user has the READMEOSS HTML file, upload it via the packaged CLI helper (default search locations are `~/Downloads` and `~/Documents`):

```bash
pnpm exec rui-upload-readme-oss "<release-tag>"
```

Prints `{"uploaded": "<asset name>", "status": "created"|"exists"}`. `exists` means a READMEOSS asset was already attached and nothing was re-uploaded — safe to re-run this phase, GitHub rejects a duplicate asset name with a 422 otherwise. If it errors with no match found, ask the user where the file was saved and pass that path as a 2nd argument: `rui-upload-readme-oss "<release-tag>" "<explicit path>"`.

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

- `conclusion: success` → means the API call didn't error, not that the version is live. The workflow calls the Marketplace `createDraft`/`publishDraft` endpoints, which only return an accepted/rejected response for the write — they don't hand back the resulting version state, so a 200 here isn't proof the version is visible yet. Confirm with a read: `marketplace-mcp`'s `get_content_versions` with `contentId` = `appNumber` from Phase 0, and check `<version>` is listed. If `marketplace-mcp` isn't connected or errors, ask the user to check the widget's Marketplace listing page directly for `<version>`. Don't declare the release done until one of the two confirms it.

    Then verify the changelog PR merged (repo automation should have done it):

    ```bash
    gh pr list --head "tmp/<release-tag>" --json number,state
    ```

    Still open after a successful publish is unexpected — check whether the workflow's `merge-changelogs-pr` step ran. Don't merge it yourself: branch protection requires team approvals, so tell the user the PR is waiting and it's on them to gather approvals and merge.

- `conclusion: failure` → **before assuming stuck-draft or escalating, check history first**:
    ```bash
    gh run view <databaseId> --log-failed | grep -A3 "Response status Code"
    ```
    If it's a `409` on `POST .../packages/<appNumber>/versions`:
    1. Check whether an **earlier run for this exact tag already succeeded**: `gh run list --workflow="Publishes a package to marketplace" --json databaseId,status,conclusion,createdAt,headBranch` filtered to this tag. If one did, the 409 means **the version is already published** — report that, don't escalate, retry, or teardown.
    2. If no prior success: check for two runs created seconds apart for the same tag (double-trigger). Otherwise it's a genuine stuck server-side state, same as the last incident — not caused by our script.
    3. Only then escalate, and don't pick a direction yourself: report appNumber, tag, endpoint, error, and ask whether to (a) dig through the failed run's logs together and check Marketplace → package page → Manage Versions for a stuck draft, or (b) retry, if they know something changed on the Marketplace side.
    4. Never `gh run rerun` speculatively — 3 identical reruns with no state change happened before and changed nothing. Rerun once, after the user confirms they acted (deleted a draft, etc.).

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

- **Writing inline `ts-node -e` scripts instead of using the packaged CLI helpers** — `rui-package-info`, `rui-changelog`, `rui-bump-version`, `rui-create-jira-version`, `rui-generate-oss-sbom`, `rui-upload-readme-oss` (in `automation/utils/bin/`) already wrap every bit of release logic this skill needs. Never reimplement it ad hoc.
- **Working around a helper's refusal instead of fixing the input** — a refusal ("no positive marketplace.appNumber", "not greater than the current version") means the wrong package or version reached it. Go back to Phase 0/2, don't bump the widget by hand.
- **Publishing before the asset gate passes** — never `gh release edit --draft=false` without confirming both MPK and READMEOSS are attached. This is what created the 409 double-trigger risk.
- **Escalating a 409 without checking run history first** — `PublishMarketplace.yml` fires automatically on `release: published`, but a human may also have re-run it manually for the same tag. The second run 409s on an already-published package: a real HTTP error, not a real incident. Check `gh run list` for the tag first.
- **Running rollback commands without the explicit go-ahead** — the one phase where the carve-out doesn't apply. List, then wait.
