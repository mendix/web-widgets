import { mergeAttributes } from "@tiptap/core";
// Imported from the umbrella package, which is a direct dependency;
// `@tiptap/extension-bullet-list` is only transitively available.
import { BulletList } from "@tiptap/extension-list";
import { computeMaxMarkerSize, maxMarkerSizeToAttrs } from "../utils/markerFormat";

export interface BulletListStyledOptions {
    styleDataFormat: "inline" | "class";
}

/**
 * Bullet list that publishes the largest marker size among its direct items.
 *
 * An enlarged marker grows leftward out of the list's `padding-left`, so the stylesheet
 * widens the gutter from this value. Emitted only when an item actually has an enlarged
 * marker, so unformatted lists render unchanged.
 *
 * Kept fresh in the live view by the decoration plugin in `ListItemMarkerFormat`, for the
 * same `toDOM` staleness reason documented there.
 */
export const BulletListStyled = BulletList.extend<BulletListStyledOptions>({
    name: "bulletList",

    addOptions() {
        return {
            ...this.parent?.(),
            styleDataFormat: "inline"
        };
    },

    renderHTML(props) {
        const { node, HTMLAttributes } = props;
        const merged = mergeAttributes(
            HTMLAttributes,
            maxMarkerSizeToAttrs(computeMaxMarkerSize(node), this.options.styleDataFormat)
        );

        // `BulletList` always defines `renderHTML`; the fallback only guards against an
        // upstream change removing it.
        return this.parent?.({ ...props, HTMLAttributes: merged }) ?? ["ul", merged, 0];
    }
});
