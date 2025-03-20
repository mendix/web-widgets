import Quill, { Range } from "quill";
import { Dispatch, MutableRefObject, SetStateAction, useState } from "react";
import {
    imageConfigType,
    viewCodeConfigType,
    type linkConfigType,
    type videoConfigType,
    type videoEmbedConfigType
} from "../../utils/formats";
import { type ChildDialogProps } from "../ModalDialog/Dialog";
import { type VideoFormType } from "../ModalDialog/VideoDialog";
import { Delta } from "quill/core";
import { IMG_MIME_TYPES } from "./constants";
import Emitter from "quill/core/emitter";

type ModalReturnType = {
    showDialog: boolean;
    setShowDialog: Dispatch<SetStateAction<boolean>>;
    dialogConfig: ChildDialogProps;
    customLinkHandler(value: any): void;
    customVideoHandler(value: any): void;
    customViewCodeHandler(value: any): void;
    customImageUploadHandler(value: any): void;
};

export function useEmbedModal(ref: MutableRefObject<Quill | null>): ModalReturnType {
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogConfig, setDialogConfig] = useState<ChildDialogProps>({});

    const closeDialog = (): void => {
        setShowDialog(false);
        setTimeout(() => ref.current?.focus(), 50);
    };
    const customLinkHandler = (value: any): void => {
        const selection = ref.current?.getSelection();
        const text = selection ? ref.current?.getText(selection.index, selection.length) : "";
        if (value) {
            setDialogConfig({
                dialogType: "link",
                config: {
                    onSubmit: (value: linkConfigType) => {
                        const index = selection?.index ?? 0;
                        const length = selection?.length ?? 0;
                        const textToDisplay = value.text ?? value.href;
                        const linkDelta = new Delta().retain(index).insert(textToDisplay).delete(length);
                        ref.current?.updateContents(linkDelta);
                        ref.current?.setSelection(index, textToDisplay.length);
                        ref.current?.format("link", value);
                        closeDialog();
                    },
                    onClose: closeDialog,
                    defaultValue: { ...value, text }
                }
            });
            setShowDialog(true);
        } else {
            ref.current?.format("link", false);
            closeDialog();
        }
    };

    const customVideoHandler = (value: any): void => {
        const selection = ref.current?.getSelection();
        if (value === true) {
            setDialogConfig({
                dialogType: "video",
                config: {
                    onSubmit: (value: VideoFormType) => {
                        if (Object.hasOwn(value, "src") && (value as videoConfigType).src !== undefined) {
                            const currentValue = value as videoConfigType;
                            const delta = new Delta()
                                .retain(selection?.index ?? 0)
                                .delete(selection?.length ?? 0)
                                .insert(
                                    { video: currentValue },
                                    { width: currentValue.width, height: currentValue.height }
                                );
                            ref.current?.updateContents(delta, Emitter.sources.USER);
                        } else {
                            const currentValue = value as videoEmbedConfigType;
                            const res = ref.current?.clipboard.convert({
                                html: currentValue.embedcode
                            });
                            if (res) {
                                const delta = new Delta()
                                    .retain(selection?.index ?? 0)
                                    .delete(selection?.length ?? 0)
                                    .concat(res);
                                ref.current?.updateContents(delta, Emitter.sources.USER);
                            }
                        }

                        closeDialog();
                    },
                    onClose: closeDialog,
                    selection: ref.current?.getSelection()
                }
            });
            setShowDialog(true);
        } else {
            ref.current?.format("link", false);
            closeDialog();
        }
    };

    const customViewCodeHandler = (value: any): void => {
        if (value === true) {
            setDialogConfig({
                dialogType: "view-code",
                config: {
                    currentCode: ref.current?.getSemanticHTML(),
                    onSubmit: (value: viewCodeConfigType) => {
                        const newDelta = ref.current?.clipboard.convert({ html: value.src });
                        if (newDelta) {
                            ref.current?.setContents(newDelta, Quill.sources.USER);
                        }
                        closeDialog();
                    },
                    onClose: closeDialog
                }
            });
            setShowDialog(true);
        } else {
            ref.current?.format("link", false);
            closeDialog();
        }
    };

    const customImageUploadHandler = (value: any): void => {
        // Check if this is an edit of an existing image
        const selection = ref.current?.getSelection() || null;
        const isEdit = typeof value === "object" && value !== true;

        // If we have a direct image reference (from Alt button), use it directly
        let activeImageElement: HTMLImageElement | null = null;

        if (isEdit && value.src) {
            // This is likely coming from the Alt button click with a direct image reference
            // Find the image by src attribute as a fallback when selection isn't available
            activeImageElement = findImageBySrc(ref, value.src);
        } else {
            // Try to get the image from selection
            activeImageElement = isEdit ? getActiveImageElement(ref, selection) : null;
        }

        // Get the current alt text if it exists
        const currentAlt = activeImageElement?.getAttribute("alt") || "";

        setDialogConfig({
            dialogType: "image",
            config: {
                onSubmit: (value: imageConfigType) => {
                    const range = ref.current?.getSelection(true);

                    // If editing an existing image, update only its alt text
                    if (activeImageElement) {
                        if (value.alt !== undefined) {
                            activeImageElement.setAttribute("alt", value.alt);
                        }
                    }
                    // Otherwise, handle new image upload if files are provided
                    else if (range && value.files) {
                        uploadImage(ref, range, value);
                    }

                    closeDialog();
                },
                onClose: closeDialog,
                // Pass props to disable file upload when editing
                disableFileUpload: !!activeImageElement,
                // Pass the current alt text for editing
                alt: currentAlt
            }
        });
        setShowDialog(true);
    };

    return {
        showDialog,
        setShowDialog,
        dialogConfig,
        customLinkHandler,
        customVideoHandler,
        customViewCodeHandler,
        customImageUploadHandler
    };
}

/**
 * Helper function to find an image element by its src attribute
 * This is used as a fallback when selection is not available
 */
function findImageBySrc(ref: MutableRefObject<Quill | null>, src: string): HTMLImageElement | null {
    if (!ref.current) {
        return null;
    }

    const quill = ref.current as any;
    if (quill.root) {
        // Try to find the image by src attribute
        const images = quill.root.querySelectorAll("img");
        for (const img of images) {
            if (img.src === src) {
                return img as HTMLImageElement;
            }
        }
    }

    return null;
}

/**
 * Helper function to get the currently selected image element
 */
function getActiveImageElement(ref: MutableRefObject<Quill | null>, selection: Range | null): HTMLImageElement | null {
    if (!selection || !ref.current) {
        return null;
    }

    // First try to get the exact element at the selection
    const [leaf] = ref.current.getLeaf(selection.index);
    if (leaf && leaf.domNode && leaf.domNode instanceof HTMLElement && leaf.domNode.tagName === "IMG") {
        return leaf.domNode as HTMLImageElement;
    }

    // If not found, try to look at the parents of the current selection
    const quill = ref.current as any;
    if (quill.root) {
        const blot = quill.scroll.find(selection.index);
        if (blot && blot.domNode) {
            // If the blot itself is an image
            if (blot.domNode instanceof HTMLElement && blot.domNode.tagName === "IMG") {
                return blot.domNode as HTMLImageElement;
            }

            // Or if it contains an image
            if (blot.domNode instanceof HTMLElement) {
                const img = blot.domNode.querySelector("img");
                if (img) {
                    return img as HTMLImageElement;
                }
            }
        }
    }

    return null;
}

function uploadImage(ref: MutableRefObject<Quill | null>, range: Range, options: imageConfigType): void {
    const uploads: File[] = [];
    const { files } = options;
    if (files) {
        Array.from(files).forEach(file => {
            if (file && IMG_MIME_TYPES.includes(file.type)) {
                uploads.push(file);
            }
        });
        if (uploads.length > 0) {
            if (!ref.current?.scroll.query("image")) {
                return;
            }
            const promises = uploads.map<Promise<string>>(file => {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(promises).then(images => {
                const update = images.reduce((delta: Delta, image) => {
                    return delta.insert({ image }, { alt: options.alt, width: options.width, height: options.height });
                }, new Delta().retain(range.index).delete(range.length)) as Delta;
                ref.current?.updateContents(update, Emitter.sources.USER);
                ref.current?.setSelection(range.index + images.length, Emitter.sources.SILENT);
            });
        }
    }
}
