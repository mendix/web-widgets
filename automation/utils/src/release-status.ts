import type { LogSection } from "./changelog-parser/types.ts";

export interface Commit {
    sha: string;
    date: string;
    subject: string;
    pr: number | null;
    type: string;
}

export interface DraftInfo {
    tag: string;
    name: string;
    url: string;
    createdAt: string;
    hasMpk: boolean;
    hasOssReadme: boolean;
    changelogPr: { number: number; url: string; state: "open" | "merged" | "closed" } | null;
}

export type DraftStage = "changelog-pr-open" | "awaiting-oss-readme" | "ready-to-publish";

export type TargetState = "in-progress" | "ready" | "needs-changelog" | "up-to-date" | "never-released";

export interface ChangelogGroup {
    name: string | null;
    sections: LogSection[];
}

export interface TargetStatus {
    name: string;
    appName: string;
    appNumber: number;
    kind: "widget" | "module";
    path: string;
    version: string;
    lastRelease: { tag: string; date: string } | null;
    wraps: string[];
    state: TargetState;
    draft: (DraftInfo & { stage: DraftStage }) | null;
    unreleased: ChangelogGroup[];
    commits: Commit[];
    commitsAfterDraft: Commit[];
}

const NON_USER_FACING_TYPES = new Set(["test", "tests", "chore", "ci", "docs", "style", "build", "e2e"]);

const RELEASE_COMMITS = [
    /^chore\([^)]+\): (update changelog|bump version to )/,
    /^.+ v\d+\.\d+\.\d+: Update changelog/
];

export function parseCommit(sha: string, date: string, subject: string): Commit {
    const type = /^(\w+)(?:\([^)]*\))?!?:/.exec(subject)?.[1].toLowerCase() ?? "other";
    const pr = /\(#(\d+)\)\s*$/.exec(subject)?.[1];
    return { sha, date, subject, pr: pr ? Number(pr) : null, type };
}

export function isReleaseCommit(commit: Commit): boolean {
    return RELEASE_COMMITS.some(pattern => pattern.test(commit.subject));
}

/** Whether a commit's conventional type suggests users of the widget can notice it. */
export function isUserFacing(commit: Commit): boolean {
    return !NON_USER_FACING_TYPES.has(commit.type);
}

/** User-facing commits made after a draft release was cut, so they are not part of it. */
export function userFacingCommitsAfter(commits: Commit[], draftCreatedAt: string): Commit[] {
    const cutAt = Date.parse(draftCreatedAt);
    return commits.filter(commit => isUserFacing(commit) && Date.parse(commit.date) > cutAt);
}

export function draftStage(draft: DraftInfo): DraftStage {
    if (draft.changelogPr?.state === "open") {
        return "changelog-pr-open";
    }
    return draft.hasMpk && draft.hasOssReadme ? "ready-to-publish" : "awaiting-oss-readme";
}

export function classifyTarget(input: {
    draft: DraftInfo | null;
    hasRelease: boolean;
    unreleased: ChangelogGroup[];
    commits: Commit[];
}): TargetState {
    if (input.draft) {
        return "in-progress";
    }
    if (!input.hasRelease) {
        return "never-released";
    }
    if (input.unreleased.some(group => group.sections.length > 0)) {
        return "ready";
    }
    return input.commits.some(isUserFacing) ? "needs-changelog" : "up-to-date";
}
