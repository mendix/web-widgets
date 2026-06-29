import { getEditorPersistenceSnapshot, serializeQuillDelta } from "../deltaPersistence";

describe("deltaPersistence", () => {
    it("serializes Quill contents as JSON", () => {
        const quill = {
            getSemanticHTML: () => "<p>Hello <strong>world</strong></p>",
            getContents: () => ({
                ops: [{ insert: "Hello " }, { insert: "world", attributes: { bold: true } }, { insert: "\n" }]
            })
        };

        expect(serializeQuillDelta(quill)).toBe(
            JSON.stringify({
                ops: [{ insert: "Hello " }, { insert: "world", attributes: { bold: true } }, { insert: "\n" }]
            })
        );
    });

    it("returns only HTML when Delta persistence is disabled", () => {
        const quill = {
            getSemanticHTML: () => "<p>Hello</p>",
            getContents: () => ({ ops: [{ insert: "Hello\n" }] })
        };

        expect(getEditorPersistenceSnapshot(quill, false)).toEqual({
            html: "<p>Hello</p>"
        });
    });

    it("returns HTML and Delta JSON when Delta persistence is enabled", () => {
        const quill = {
            getSemanticHTML: () => "<p>Hello</p>",
            getContents: () => ({ ops: [{ insert: "Hello\n" }] })
        };

        expect(getEditorPersistenceSnapshot(quill, true)).toEqual({
            html: "<p>Hello</p>",
            deltaJson: JSON.stringify({ ops: [{ insert: "Hello\n" }] })
        });
    });

    it("returns an empty Delta when Quill is not available", () => {
        expect(serializeQuillDelta(null)).toBe(JSON.stringify({ ops: [] }));
    });
});
