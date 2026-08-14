import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { sanitizeWordHtml } from "../utils/wordPaste";

/**
 * Cleans HTML pasted from Microsoft Word before ProseMirror parses it.
 *
 * `transformPastedHTML` is a ProseMirror prop rather than a command, so it is
 * contributed through a plugin. The transform itself lives in `utils/wordPaste`
 * as a pure function, which keeps it testable without an editor and keeps this
 * extension to registration only.
 *
 * Note this runs on paste ONLY — not for `setContent` or the initial content
 * value. Unit-aware `margin-left` parsing for those paths lives in `Indent`.
 */
export const WordPaste = Extension.create({
    name: "wordPaste",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("wordPaste"),
                props: {
                    transformPastedHTML: html => sanitizeWordHtml(html)
                }
            })
        ];
    }
});
