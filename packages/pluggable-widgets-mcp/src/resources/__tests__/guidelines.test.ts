import { describe, expect, it } from "vitest";
import { GUIDELINE_RESOURCES, loadGuidelineContent } from "@/resources/guidelines";

describe("guideline resources", () => {
    it("exposes the property-types and widget-patterns guidelines", () => {
        expect(GUIDELINE_RESOURCES.map(resource => resource.uri).sort()).toEqual([
            "mendix://guidelines/property-types",
            "mendix://guidelines/widget-patterns"
        ]);
    });

    // These files are served to the client and are load-bearing: the server generates XML but the
    // model writes the component, using widget-patterns as its reference. They ship via the
    // package's `files` field, so a packaging mistake breaks them silently in an installed copy.
    it.each(GUIDELINE_RESOURCES)("loads $filename from disk", async resource => {
        const content = await loadGuidelineContent(resource.filename);
        expect(content.length).toBeGreaterThan(100);
    });

    it("throws a named error for a missing guideline", async () => {
        await expect(loadGuidelineContent("does-not-exist.md")).rejects.toThrow("does-not-exist.md");
    });
});
