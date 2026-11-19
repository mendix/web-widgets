import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    type Commit,
    type DraftInfo,
    classifyTarget,
    draftStage,
    isReleaseCommit,
    isUserFacing,
    parseCommit
} from "../release-status.ts";

const commit = (subject: string): Commit => parseCommit("abc", "2026-11-10T10:00:00Z", subject);

const draft = (overrides: Partial<DraftInfo> = {}): DraftInfo => ({
    tag: "badge-web-v1.0.1",
    name: "Badge v1.0.1",
    url: "https://example.test/release",
    createdAt: "2026-11-01T00:00:00Z",
    hasMpk: true,
    hasOssReadme: false,
    changelogPr: { number: 1, url: "https://example.test/pr/1", state: "merged" },
    ...overrides
});

const fixed = [{ name: null, sections: [{ type: "Fixed" as const, logs: ["We fixed it."] }] }];

describe("parseCommit", () => {
    it("reads the conventional type and the squash-merge PR number", () => {
        assert.deepEqual(
            {
                type: commit("fix(badge-web): keep focus (#2501)").type,
                pr: commit("fix(badge-web): keep focus (#2501)").pr
            },
            { type: "fix", pr: 2501 }
        );
    });

    it("falls back to 'other' for a subject without a conventional type", () => {
        assert.equal(commit("Merge branch 'main'").type, "other");
        assert.equal(commit("Merge branch 'main'").pr, null);
    });
});

describe("isReleaseCommit", () => {
    it("recognises version bumps and changelog updates made by the release pipeline", () => {
        assert.equal(isReleaseCommit(commit("chore(badge-web): bump version to 1.0.1")), true);
        assert.equal(isReleaseCommit(commit("chore(@mendix/pusher): update changelog")), true);
        assert.equal(isReleaseCommit(commit("Badge Button v3.3.0: Update changelog (#2137)")), true);
    });

    it("keeps regular work", () => {
        assert.equal(isReleaseCommit(commit("fix(badge-web): update changelog rendering")), false);
    });
});

describe("isUserFacing", () => {
    it("treats tests and chores as invisible to users, fixes and features as visible", () => {
        assert.equal(isUserFacing(commit("test(badge-web): add case")), false);
        assert.equal(isUserFacing(commit("chore: lint")), false);
        assert.equal(isUserFacing(commit("fix(badge-web): keep focus")), true);
        assert.equal(isUserFacing(commit("feat!: new api")), true);
    });
});

describe("draftStage", () => {
    it("waits on the changelog PR while it is open", () => {
        assert.equal(draftStage(draft({ changelogPr: { number: 1, url: "", state: "open" } })), "changelog-pr-open");
    });

    it("waits on OSS clearance until the READMEOSS file is attached", () => {
        assert.equal(draftStage(draft()), "awaiting-oss-readme");
        assert.equal(draftStage(draft({ hasOssReadme: true })), "ready-to-publish");
    });

    it("needs the MPK as well before it can be published", () => {
        assert.equal(draftStage(draft({ hasOssReadme: true, hasMpk: false })), "awaiting-oss-readme");
    });
});

describe("classifyTarget", () => {
    const base = { draft: null, hasRelease: true, unreleased: [], commits: [] };

    it("reports a draft release as in progress, even with unreleased entries", () => {
        assert.equal(classifyTarget({ ...base, draft: draft(), unreleased: fixed }), "in-progress");
    });

    it("reports a package that was never released", () => {
        assert.equal(classifyTarget({ ...base, hasRelease: false, unreleased: fixed }), "never-released");
    });

    it("is ready to release when the changelog has unreleased entries", () => {
        assert.equal(classifyTarget({ ...base, unreleased: fixed }), "ready");
    });

    it("flags user-facing commits that have no changelog entry", () => {
        assert.equal(classifyTarget({ ...base, commits: [commit("fix: keep focus")] }), "needs-changelog");
    });

    it("is up to date when only tests and chores changed", () => {
        assert.equal(
            classifyTarget({ ...base, commits: [commit("test: add case"), commit("chore: lint")] }),
            "up-to-date"
        );
    });
});
