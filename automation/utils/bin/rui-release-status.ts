#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { getPackageChangelog, getWidgetChangelog } from "../src/changelog-parser/index.ts";
import {
    type ChangelogGroup,
    type Commit,
    type DraftInfo,
    type TargetStatus,
    classifyTarget,
    draftStage,
    isReleaseCommit,
    userFacingCommitsAfter,
    parseCommit
} from "../src/release-status.ts";

interface RawPackage {
    name: string;
    version: string;
    private?: boolean;
    marketplace?: { appNumber?: number; appName?: string };
    mxpackage?: { type?: string; dependencies?: string[] };
}

interface GhRelease {
    tag_name: string;
    name: string;
    draft: boolean;
    html_url: string;
    created_at: string;
    assets: Array<{ name: string }>;
}

interface GhPull {
    number: number;
    html_url: string;
    state: "open" | "closed";
    merged_at: string | null;
}

const REPO = process.env.GITHUB_REPOSITORY ?? "mendix/web-widgets";
const PACKAGE_GROUPS = ["packages/pluggableWidgets", "packages/modules"];

function run(cmd: string, args: string[], cwd: string): string {
    return execFileSync(cmd, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
}

function ghApi<T>(path: string, cwd: string): T {
    return JSON.parse(run("gh", ["api", path], cwd)) as T;
}

function shortName(npmName: string): string {
    return npmName.replace(/^@mendix\//, "");
}

function scanPackages(root: string): Map<string, { path: string; pkg: RawPackage }> {
    const packages = new Map<string, { path: string; pkg: RawPackage }>();
    for (const group of PACKAGE_GROUPS) {
        for (const dir of readdirSync(join(root, group))) {
            const file = join(root, group, dir, "package.json");
            if (existsSync(file)) {
                const pkg = JSON.parse(readFileSync(file, "utf8")) as RawPackage;
                packages.set(pkg.name, { path: join(root, group, dir), pkg });
            }
        }
    }
    return packages;
}

function codePathspecs(root: string, dirs: string[]): string[] {
    return dirs.flatMap(abs => {
        const dir = relative(root, abs);
        return [
            dir,
            `:(exclude,glob)${dir}/e2e/**`,
            `:(exclude,glob)${dir}/**/__tests__/**`,
            `:(exclude,glob)${dir}/**/*.spec.*`,
            `:(exclude)${dir}/CHANGELOG.md`
        ];
    });
}

function readJsonAt(root: string, rev: string, file: string): RawPackage | null {
    try {
        return JSON.parse(run("git", ["show", `${rev}:${file}`], root)) as RawPackage;
    } catch {
        return null;
    }
}

function runtimeDependencies(pkg: RawPackage | null): string {
    const { dependencies, peerDependencies } = (pkg ?? {}) as Record<string, unknown>;
    return JSON.stringify({ dependencies, peerDependencies });
}

/** package.json edits that leave the shipped dependencies alone (scripts, devDependencies) don't reach users. */
function changesShippedCode(root: string, sha: string, files: string[]): boolean {
    return files.some(
        file =>
            !file.endsWith("/package.json") ||
            runtimeDependencies(readJsonAt(root, `${sha}^`, file)) !== runtimeDependencies(readJsonAt(root, sha, file))
    );
}

function commitsSinceVersionBump(root: string, path: string, dirs: string[]): Commit[] {
    const pkgJson = relative(root, join(path, "package.json"));
    const baseline = run("git", ["log", "-1", "--format=%H", '-G"version":', "--", pkgJson], root);
    const range = baseline ? `${baseline}..HEAD` : "HEAD";
    const out = run(
        "git",
        [
            "log",
            "--no-merges",
            range,
            "--format=%x1e%H%x09%cI%x09%s",
            "--name-only",
            "--",
            ...codePathspecs(root, dirs)
        ],
        root
    );
    return out
        .split("\x1e")
        .filter(Boolean)
        .flatMap(record => {
            const [header, ...files] = record.trim().split("\n").filter(Boolean);
            const [sha, date, ...subject] = header.split("\t");
            const commit = parseCommit(sha, date, subject.join("\t"));
            return !isReleaseCommit(commit) && changesShippedCode(root, sha, files) ? [commit] : [];
        });
}

function lastReleaseTag(root: string, name: string): { tag: string; date: string } | null {
    const out = run(
        "git",
        [
            "tag",
            "-l",
            `${shortName(name)}-v*`,
            "--sort=-v:refname",
            "--format=%(refname:short)%09%(creatordate:iso-strict)"
        ],
        root
    );
    const first = out.split("\n").find(line => /-v\d+\.\d+\.\d+\t/.test(line));
    if (!first) {
        return null;
    }
    const [tag, date] = first.split("\t");
    return { tag, date };
}

async function unreleasedChangelog(
    path: string,
    wrapped: Array<{ path: string; name: string }>
): Promise<ChangelogGroup[]> {
    const changelog = await getPackageChangelog(path);
    const groups: ChangelogGroup[] = [{ name: null, sections: changelog.changelog.content[0].sections }];
    for (const dep of wrapped) {
        if (existsSync(join(dep.path, "CHANGELOG.md"))) {
            const [unreleased] = (await getWidgetChangelog(dep.path)).changelog.content;
            groups.push({ name: dep.name, sections: unreleased.sections });
        }
    }
    return groups.filter(group => group.sections.length > 0);
}

function findChangelogPr(tag: string, root: string): DraftInfo["changelogPr"] {
    const owner = REPO.split("/")[0];
    for (const branch of [`tmp/${tag}`, `${tag}-update-changelog`]) {
        const [pr] = ghApi<GhPull[]>(`repos/${REPO}/pulls?state=all&head=${owner}:${branch}`, root);
        if (pr) {
            const state = pr.merged_at ? "merged" : pr.state;
            return { number: pr.number, url: pr.html_url, state };
        }
    }
    return null;
}

function loadDrafts(root: string): Map<string, DraftInfo> {
    const drafts = new Map<string, DraftInfo>();
    const releases = ghApi<GhRelease[]>(`repos/${REPO}/releases?per_page=100`, root);
    for (const release of releases.filter(r => r.draft)) {
        const target = release.tag_name.replace(/-v\d+\.\d+\.\d+$/, "");
        drafts.set(target, {
            tag: release.tag_name,
            name: release.name,
            url: release.html_url,
            createdAt: release.created_at,
            hasMpk: release.assets.some(asset => asset.name.endsWith(".mpk")),
            hasOssReadme: release.assets.some(asset => /READMEOSS.*\.html$/i.test(asset.name)),
            changelogPr: findChangelogPr(release.tag_name, root)
        });
    }
    return drafts;
}

async function main(): Promise<void> {
    const outFile = process.argv[2];
    const root = run("git", ["rev-parse", "--show-toplevel"], process.cwd());
    const packages = scanPackages(root);
    const errors: string[] = [];

    let drafts = new Map<string, DraftInfo>();
    try {
        drafts = loadDrafts(root);
    } catch (e) {
        errors.push(`Could not read GitHub releases: ${e instanceof Error ? e.message : String(e)}`);
    }

    const targets: TargetStatus[] = [];
    const wrappedBy = new Map<string, string>();

    for (const [name, { path, pkg }] of packages) {
        const appNumber = pkg.marketplace?.appNumber ?? -1;
        if (appNumber <= 0) {
            continue;
        }
        const wrapped = (pkg.mxpackage?.dependencies ?? [])
            .filter(dep => packages.has(dep))
            .map(dep => ({ name: dep, path: packages.get(dep)!.path }));
        wrapped.forEach(dep => wrappedBy.set(dep.name, name));

        const lastRelease = lastReleaseTag(root, name);
        const draft = drafts.get(shortName(name)) ?? null;
        const commits = commitsSinceVersionBump(root, path, [path, ...wrapped.map(dep => dep.path)]);
        const unreleased = await unreleasedChangelog(path, wrapped);

        targets.push({
            name,
            appName: pkg.marketplace?.appName ?? shortName(name),
            appNumber,
            kind: pkg.mxpackage?.type === "module" ? "module" : "widget",
            path: relative(root, path),
            version: pkg.version,
            lastRelease,
            wraps: wrapped.map(dep => dep.name),
            state: classifyTarget({ draft, hasRelease: lastRelease !== null, unreleased, commits }),
            draft: draft ? { ...draft, stage: draftStage(draft) } : null,
            unreleased,
            commits,
            commitsAfterDraft: draft ? userFacingCommitsAfter(commits, draft.createdAt) : []
        });
    }

    const unpublished = [...packages]
        .filter(([name, { pkg }]) => (pkg.marketplace?.appNumber ?? -1) <= 0 && !wrappedBy.has(name))
        .map(([name, { path, pkg }]) => ({ name, path: relative(root, path), version: pkg.version }));

    const status = {
        generatedAt: new Date().toISOString(),
        repo: REPO,
        head: {
            sha: run("git", ["rev-parse", "HEAD"], root),
            subject: run("git", ["log", "-1", "--format=%s"], root)
        },
        targets: targets.sort((a, b) => a.appName.localeCompare(b.appName)),
        unpublished,
        errors
    };

    const json = JSON.stringify(status, null, 2);
    if (outFile) {
        writeFileSync(outFile, json);
    } else {
        console.log(json);
    }
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
