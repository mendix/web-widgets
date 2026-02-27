import { afterEach, describe, expect, it, vi } from "vitest";

describe("createSessionState", () => {
    afterEach(() => {
        // resetModules required because vi.doMock re-registers per test
        vi.resetModules();
    });

    it("returns undefined projectDir when MENDIX_PROJECT_DIR is not set", async () => {
        vi.doMock("@/config", () => ({
            MENDIX_PROJECT_DIR: undefined
        }));
        const { createSessionState } = await import("@/tools/session-state");
        const state = createSessionState();
        expect(state.projectDir).toBeUndefined();
    });

    it("returns resolved projectDir when MENDIX_PROJECT_DIR is set", async () => {
        vi.doMock("@/config", () => ({
            MENDIX_PROJECT_DIR: "/resolved/path"
        }));
        const { createSessionState } = await import("@/tools/session-state");
        const state = createSessionState();
        expect(state.projectDir).toBe("/resolved/path");
    });

    it("returns mutable state", async () => {
        vi.doMock("@/config", () => ({
            MENDIX_PROJECT_DIR: undefined
        }));
        const { createSessionState } = await import("@/tools/session-state");
        const state = createSessionState();
        state.projectDir = "/new/path";
        expect(state.projectDir).toBe("/new/path");
    });
});
