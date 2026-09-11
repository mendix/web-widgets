import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { ImageFileError, pickImageFiles, readFileAsDataUrl, validateImageFile } from "../utils/imageFiles";

/**
 * Inserts image files dropped onto or pasted into the editor as base64 images,
 * matching the image dialog's Upload tab (same validation, same `data:` URI).
 *
 * Handlers are registered through `handleDOMEvents` rather than `handleDrop`/
 * `handlePaste` on purpose. ProseMirror dispatches the latter through
 * `handlers[event.type]`, which is gated on `view.editable`, and its
 * `dragover`/`dragenter` preventDefault sits behind the same gate — so on a
 * read-only editor the drop would reach the browser, which navigates the whole
 * page to the dropped file and discards unsaved form data. `handleDOMEvents`
 * runs ahead of that gate, so this extension can neutralise the event in every
 * state, including when uploading is disabled.
 *
 * The decision and insertion logic are exported as plain functions so they can
 * be tested without jsdom's stub `DataTransfer`; the plugin below is only
 * registration and DOM plumbing.
 */

/** Fired on the editor DOM node when a dropped or pasted file is rejected. */
export const IMAGE_DROP_ERROR_EVENT = "richtextImageDropError";

export interface ImagePasteDropOptions {
    /** Whether the widget's "Enable default upload" property is on. */
    isEnabled: () => boolean;
    /** Whether the editor currently accepts edits. */
    isEditable: () => boolean;
    /** Ancestor of the editor DOM that carries the drag-over class. */
    wrapperSelector: string;
    dragOverClass: string;
}

export type ImageEventDecision =
    /** No image file present: leave the event to ProseMirror. */
    | "ignore"
    /** Image file present but insertion not allowed: neutralise, insert nothing. */
    | "swallow"
    | "insert";

export interface ImageInsertContext {
    insertImage: (src: string, pos: number) => void;
    docSize: () => number;
    reportError: (error: ImageFileError) => void;
}

export function decideImageEvent(
    files: File[],
    gate: Pick<ImagePasteDropOptions, "isEnabled" | "isEditable">
): ImageEventDecision {
    if (files.length === 0) {
        return "ignore";
    }
    return gate.isEnabled() && gate.isEditable() ? "insert" : "swallow";
}

/**
 * Document position under the drop, falling back to the selection. `posAtCoords`
 * needs layout APIs (`elementFromPoint`); the event has already been prevented by
 * the time it is called, so a throw there would silently lose the image.
 */
export function dropPosition(view: EditorView, coords: { clientX: number; clientY: number }): number {
    try {
        return view.posAtCoords({ left: coords.clientX, top: coords.clientY })?.pos ?? view.state.selection.from;
    } catch {
        return view.state.selection.from;
    }
}

/** True when a drag advertises files. `dataTransfer.files` is empty during a drag. */
export function dragCarriesFiles(dataTransfer: DataTransfer | null): boolean {
    return Array.from(dataTransfer?.types ?? []).includes("Files");
}

/**
 * Reads and inserts each file in order. Invalid or unreadable files are
 * reported and skipped; the remaining files are still inserted.
 *
 * Reading is asynchronous while the DOM handler must answer synchronously, so
 * the target position is captured by the caller before the read starts. The
 * document can change in between, so every insert clamps to the current
 * document size.
 */
export async function insertImageFiles(files: File[], pos: number, ctx: ImageInsertContext): Promise<void> {
    let at = pos;

    for (const file of files) {
        const error = validateImageFile(file);
        if (error) {
            ctx.reportError(error);
            continue;
        }

        let src: string;
        try {
            src = await readFileAsDataUrl(file);
        } catch {
            ctx.reportError({ key: "image.errorReadFailed" });
            continue;
        }

        const target = Math.min(at, ctx.docSize());
        ctx.insertImage(src, target);
        // An image node has size 1, so the next file lands after this one and
        // multiple dropped files keep their drop order.
        at = target + 1;
    }
}

export const ImagePasteDrop = Extension.create<ImagePasteDropOptions>({
    name: "imagePasteDrop",

    addOptions() {
        return {
            isEnabled: () => true,
            isEditable: () => true,
            wrapperSelector: ".tiptap-wrapper",
            dragOverClass: "rich-text-drag-over"
        };
    },

    addProseMirrorPlugins() {
        const options = this.options;
        const editor = this.editor;
        // dragenter/dragleave fire for every descendant the pointer crosses, so
        // a plain toggle flickers over text. Count enters instead.
        let dragDepth = 0;

        const wrapperOf = (dom: HTMLElement): HTMLElement =>
            (dom.closest(options.wrapperSelector) as HTMLElement | null) ?? dom;

        const setDragOver = (dom: HTMLElement, active: boolean): void => {
            wrapperOf(dom).classList.toggle(options.dragOverClass, active);
        };

        const context = (): ImageInsertContext => ({
            insertImage: (src, pos) => {
                editor.commands.insertContentAt(pos, { type: "image", attrs: { src } });
            },
            docSize: () => editor.state.doc.content.size,
            reportError: error => {
                editor.view.dom.dispatchEvent(new CustomEvent(IMAGE_DROP_ERROR_EVENT, { detail: error }));
            }
        });

        return [
            new Plugin({
                key: new PluginKey("imagePasteDrop"),
                props: {
                    handleDOMEvents: {
                        dragenter: (view, event) => {
                            if (!dragCarriesFiles(event.dataTransfer)) {
                                return false;
                            }
                            // Prevented even when insertion is not allowed: without it the
                            // browser owns the drop on a read-only view.
                            event.preventDefault();
                            dragDepth += 1;
                            if (options.isEnabled() && options.isEditable()) {
                                setDragOver(view.dom as HTMLElement, true);
                            }
                            return true;
                        },
                        dragover: (_view, event) => {
                            if (!dragCarriesFiles(event.dataTransfer)) {
                                return false;
                            }
                            event.preventDefault();
                            return true;
                        },
                        dragleave: (view, event) => {
                            if (!dragCarriesFiles(event.dataTransfer)) {
                                return false;
                            }
                            dragDepth = Math.max(0, dragDepth - 1);
                            if (dragDepth === 0) {
                                setDragOver(view.dom as HTMLElement, false);
                            }
                            return false;
                        },
                        drop: (view, event) => {
                            const files = pickImageFiles(event.dataTransfer?.files);
                            const decision = decideImageEvent(files, options);
                            if (decision === "ignore") {
                                return false;
                            }

                            event.preventDefault();
                            dragDepth = 0;
                            setDragOver(view.dom as HTMLElement, false);

                            if (decision === "swallow") {
                                return true;
                            }

                            insertImageFiles(files, dropPosition(view, event), context());
                            return true;
                        },
                        paste: (view, event) => {
                            // Rich content pasted from Word or Google Docs can carry an image
                            // file alongside its HTML. That HTML is the paste the user means,
                            // and it still has to reach `WordPaste`, so only a file-only
                            // clipboard (a screenshot, a copied image file) is intercepted.
                            if (Array.from(event.clipboardData?.types ?? []).includes("text/html")) {
                                return false;
                            }

                            const files = pickImageFiles(event.clipboardData?.files);
                            const decision = decideImageEvent(files, options);
                            if (decision === "ignore") {
                                return false;
                            }

                            event.preventDefault();
                            if (decision === "swallow") {
                                return true;
                            }

                            insertImageFiles(files, view.state.selection.from, context());
                            return true;
                        }
                    }
                }
            })
        ];
    }
});
