import { mergeAttributes } from "@tiptap/core";
import { ListItem } from "@tiptap/extension-list-item";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import {
    computeMarkerFormat,
    computeMarkerLength,
    computeMaxMarkerSize,
    markerFormatToAttrs,
    maxMarkerSizeToAttrs
} from "../utils/markerFormat";

export interface ListItemMarkerFormatOptions {
    styleDataFormat: "inline" | "class";
}

const markerFormatPluginKey = new PluginKey("listItemMarkerFormat");

/** Lists whose markers participate; `taskList` renders checkboxes and has no `::marker`. */
const GUTTER_LIST_TYPES = new Set(["orderedList", "bulletList"]);

/**
 * Makes a list item's bullet or number follow the format of its first inline run.
 *
 * Marker format is *derived*, never stored. Nothing is written to the document, so opening
 * existing content does not modify it — which matters because `Editor.tsx` reconciles by
 * comparing `editor.getHTML()` against the bound value, and `onUpdate` pushes every
 * transaction back out. A document mutation here would dirty every existing list document
 * on load and fire change actions.
 *
 * Deriving it requires two delivery paths, because neither alone is sufficient:
 *
 *   renderHTML  — feeds getHTML(), copy/paste and the initial view render, but ProseMirror
 *                 only re-invokes toDOM when a node's *markup* changes. `sameMarkup`
 *                 compares type/attrs/marks, not content, so restyling the first run reuses
 *                 the existing <li> element and the attribute would go stale.
 *   decoration  — keeps the live <li> fresh, but decorations live in the view and never
 *                 reach getHTML().
 *
 * Both call `computeMarkerFormat`, so they cannot disagree.
 *
 * No node attribute is declared, so `parseHTML` ignores incoming `--rt-marker-*` and
 * `data-marker-*`: pasted or reloaded content drops stale marker data and recomputes it.
 */
export const ListItemMarkerFormat = ListItem.extend<ListItemMarkerFormatOptions>({
    name: "listItem",

    addOptions() {
        return {
            ...this.parent?.(),
            styleDataFormat: "inline"
        };
    },

    renderHTML(props) {
        const { node, HTMLAttributes } = props;
        // Merge into HTMLAttributes and delegate, rather than rebuilding the spec, so any
        // upstream ListItem rendering logic keeps working. `mergeAttributes` concatenates
        // `style` and `class` rather than overwriting them.
        const merged = mergeAttributes(
            HTMLAttributes,
            markerFormatToAttrs(computeMarkerFormat(node), this.options.styleDataFormat)
        );

        // `ListItem` always defines `renderHTML`; the fallback only guards against an
        // upstream change removing it.
        return this.parent?.({ ...props, HTMLAttributes: merged }) ?? ["li", merged, 0];
    },

    addProseMirrorPlugins() {
        const styleDataFormat = this.options.styleDataFormat;

        return [
            ...(this.parent?.() ?? []),
            new Plugin({
                key: markerFormatPluginKey,
                state: {
                    init: (_, state) => buildDecorations(state.doc, styleDataFormat),
                    apply(transaction, previous, _oldState, newState) {
                        // Selection-only transactions cannot change any marker.
                        if (!transaction.docChanged) {
                            return previous;
                        }
                        return buildDecorations(newState.doc, styleDataFormat);
                    }
                },
                props: {
                    decorations: state => markerFormatPluginKey.getState(state)
                }
            })
        ];
    }
});

/**
 * Node decorations carrying marker format for every list item and gutter size for every
 * list, at any nesting depth.
 *
 * Merging with what `toDOM` already emitted is safe: prosemirror-view appends decoration
 * `style` (`dom.style.cssText += cur.style`) and adds decoration classes via
 * `classList.add`, so neither clobbers the node's own attributes.
 */
function buildDecorations(doc: ProseMirrorNode, styleDataFormat: "inline" | "class"): DecorationSet {
    const decorations: Decoration[] = [];

    doc.descendants((node, pos) => {
        // `taskItem`/`taskList` are distinct node types and never match, so task lists are
        // excluded without an explicit guard.
        const attrs =
            node.type.name === "listItem"
                ? markerFormatToAttrs(computeMarkerFormat(node), styleDataFormat)
                : GUTTER_LIST_TYPES.has(node.type.name)
                  ? maxMarkerSizeToAttrs(computeMaxMarkerSize(node), styleDataFormat, computeMarkerLength(node))
                  : null;

        if (attrs && Object.keys(attrs).length > 0) {
            decorations.push(Decoration.node(pos, pos + node.nodeSize, attrs));
        }
    });

    return DecorationSet.create(doc, decorations);
}
