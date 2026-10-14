---
name: bump-transitive
description: Surgically bump a vulnerable transitive dependency to its latest patch per major using pnpm.overrides, then clean up without leaving override traces in package.json.
---

# Fix Vulnerable Transitive Dependency

Use when a security advisory identifies a vulnerable transitive package (one not directly in any `package.json`) and you need to force it to a safe version across the monorepo without bumping unrelated packages.

The user will provide the package name and the fixed versions from the advisory.

## Process

### 1. Discover all versions in use

Run `pnpm why -r` to see every resolved version and the full dependency chain explaining why each exists:

```sh
pnpm why -r <package>
```

Each top-level line (`<package>@x.y.z`) is a distinct version in the graph. The tree below it shows which packages pull it in — useful for understanding whether a version can be collapsed or must stay separate.

To extract just the version list:

```sh
pnpm why -r <package> | grep '^<package>@'
```

### 2. Find latest safe version per major

For each major currently in the lockfile, find the latest available version on npm:

```sh
npm view <package> versions --json | node -e "
const v = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
const majors = {};
v.forEach(ver => {
  const m = parseInt(ver.split('.')[0]);
  if (!majors[m]) majors[m] = [];
  majors[m].push(ver);
});
Object.entries(majors).forEach(([m, vers]) => {
  console.log('Major', m, '— latest:', vers[vers.length-1]);
});
"
```

Cross-reference with the advisory's "Fixed in" versions — use whichever is higher.

### 3. Add overrides to root package.json

In the `pnpm.overrides` section of the root `package.json`, add one entry per major using the `@major` selector syntax:

```json
"pnpm": {
  "overrides": {
    "<package>@1": "1.x.y",
    "<package>@2": "2.x.y",
    "<package>@5": "5.x.y"
  }
}
```

Only add majors that are actually present in the lockfile.

### 4. First pnpm install — update the lockfile

```sh
pnpm install
```

This writes the pinned versions into `pnpm-lock.yaml`.

### 5. Remove the overrides from package.json

Delete the entries added in step 3. The lockfile now has the correct versions recorded and will enforce them on its own.

### 6. Second pnpm install — clean up

```sh
pnpm install
```

This removes the override snapshot from the lockfile's config block and leaves a clean state: no trace of the rewrite in `package.json`, no stale override metadata in the lockfile.

### 7. Verify

Check that the lockfile diff is surgical — only the target package versions changed:

```sh
git diff pnpm-lock.yaml | grep '^[-+]' | grep -v '^---\|^+++' | grep -v '<package>'
```

The only non-target lines should be inconsequential formatting shuffles (identical values on both sides of the diff). If other packages were bumped, investigate before proceeding.

## Rules

- **Never run `pnpm update` or `pnpm upgrade`** — these re-resolve the entire dependency graph.
- **Never delete `pnpm-lock.yaml`** — regenerating it from scratch bumps everything within semver ranges.
- **Never use `--frozen-lockfile`** on either install — the first install must update the lockfile, the second must reconcile the config snapshot.
- Only add overrides for majors actually present in the lockfile — do not add speculative entries.
- If the package is a **direct** dependency (appears in a `package.json` `dependencies`/`devDependencies`), edit that file directly instead of using overrides.
