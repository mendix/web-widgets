import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultReleaseNotesHtmlOptions, releaseNotesToHtml } from "../release-notes-html.ts";

const widgetNotes = `### Fixed

- We fixed an issue with **bold** and \`code\`.

- See [docs](https://docs.mendix.com).`;

describe("releaseNotesToHtml", () => {
    it("renders widget release notes as compact simple HTML", () => {
        assert.equal(
            releaseNotesToHtml(widgetNotes),
            "<h4>Fixed</h4><ul>" +
                "<li>We fixed an issue with <strong>bold</strong> and <code>code</code>.</li>" +
                '<li>See <a href="https://docs.mendix.com">docs</a>.</li></ul>'
        );
    });

    it("maps module subcomponent headings to h4 and section headings to h5", () => {
        assert.equal(
            releaseNotesToHtml("### Gallery\n\n#### Fixed\n\n- A fix."),
            "<h4>Gallery</h4><h5>Fixed</h5><ul><li>A fix.</li></ul>"
        );
    });

    it("escapes raw HTML instead of passing it through", () => {
        assert.equal(releaseNotesToHtml("- <script>x</script>"), "<ul><li>&lt;script&gt;x&lt;/script&gt;</li></ul>");
    });

    it("drops images", () => {
        assert.equal(releaseNotesToHtml("![logo](https://example.com/a.png)"), "<p>logo</p>");
    });

    it("can render headings as bold paragraphs and keep list item paragraphs", () => {
        const html = releaseNotesToHtml(widgetNotes, {
            ...defaultReleaseNotesHtmlOptions,
            headings: { ...defaultReleaseNotesHtmlOptions.headings, h3: "strong" },
            tightLists: false
        });
        assert.ok(html.startsWith("<p><strong>Fixed</strong></p><ul><li><p>We fixed"), html);
    });

    it("returns an empty string for empty notes", () => {
        assert.equal(releaseNotesToHtml("  \n"), "");
    });
});
