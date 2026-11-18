import markdownIt, { type MarkdownIt, type StateCore, type Token } from "markdown-it";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface ReleaseNotesHtmlOptions {
    /** Tag used for each markdown heading level; `"strong"` renders the heading as `<p><strong>…</strong></p>`. */
    headings: Record<HeadingTag, HeadingTag | "strong">;
    /** Drop the `<p>` that markdown wraps around items of lists separated by blank lines. */
    tightLists: boolean;
    /** Remove the newlines markdown-it puts between block tags. */
    compact: boolean;
}

/**
 * Marketplace release notes are shown as rich text (the kind CKEditor produces),
 * so the GitHub release markdown is reduced to simple HTML: paragraphs, lists,
 * headings, emphasis, inline code and links. Images become their alt text and raw
 * HTML is escaped. Headings start at h4 because the Marketplace page already renders
 * the release title as an h3.
 */
export const defaultReleaseNotesHtmlOptions: ReleaseNotesHtmlOptions = {
    headings: { h1: "h4", h2: "h4", h3: "h4", h4: "h5", h5: "h5", h6: "h5" },
    tightLists: true,
    compact: true
};

export function releaseNotesToHtml(
    markdown: string,
    options: ReleaseNotesHtmlOptions = defaultReleaseNotesHtmlOptions
): string {
    const html = createRenderer(options).render(markdown.trim());
    return options.compact ? html.replace(/>\s*\n\s*</g, "><").trim() : html.trim();
}

function createRenderer(options: ReleaseNotesHtmlOptions): MarkdownIt {
    const md = markdownIt("commonmark", { html: false, linkify: true, typographer: false });
    md.enable("linkify");
    md.disable(["fence", "code", "hr"]);
    md.renderer.rules.image = (tokens, idx) => md.utils.escapeHtml(tokens[idx].content);

    md.core.ruler.push("release_notes_html", state => {
        mapHeadings(state, options.headings);
        if (options.tightLists) {
            hideListItemParagraphs(state.tokens);
        }
    });

    return md;
}

function mapHeadings(state: StateCore, headings: ReleaseNotesHtmlOptions["headings"]): void {
    const { tokens } = state;
    tokens.forEach((token, i) => {
        if (token.type !== "heading_open" && token.type !== "heading_close") {
            return;
        }
        const target = headings[token.tag as HeadingTag];
        if (target !== "strong") {
            token.tag = target;
            return;
        }
        token.tag = "p";
        const inline = tokens[i + 1];
        if (token.type === "heading_open" && inline?.type === "inline") {
            inline.children = [
                new state.Token("strong_open", "strong", 1),
                ...(inline.children ?? []),
                new state.Token("strong_close", "strong", -1)
            ];
        }
    });
}

function hideListItemParagraphs(tokens: Token[]): void {
    let listItemDepth = 0;
    for (const token of tokens) {
        if (token.type === "list_item_open") {
            listItemDepth++;
        } else if (token.type === "list_item_close") {
            listItemDepth--;
        } else if (listItemDepth > 0 && (token.type === "paragraph_open" || token.type === "paragraph_close")) {
            token.hidden = true;
        }
    }
}
