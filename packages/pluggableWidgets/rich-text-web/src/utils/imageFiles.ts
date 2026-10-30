import type { TranslationKey } from "./i18n";

/**
 * Shared image-file handling for every path that turns a `File` into a base64
 * image: the image dialog's Upload tab and the editor's drop/paste handling
 * (`extensions/ImagePasteDrop`). Both must accept and reject exactly the same
 * files, so the rules live here and nowhere else.
 *
 * Errors are returned as a translation key plus its `###` substitution rather
 * than as finished text: the drop/paste path runs inside a ProseMirror plugin,
 * outside React, where `useT()` is not available.
 */

/** Maximum file size for image uploads (5MB). */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface ImageFileError {
    key: TranslationKey;
    /** Substituted into the message's `###` placeholder, when the key has one. */
    arg?: string;
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns the rejection reason, or `null` when the file may be inserted. */
export function validateImageFile(file: File): ImageFileError | null {
    if (file.size > MAX_FILE_SIZE) {
        return { key: "image.errorTooLarge", arg: formatFileSize(file.size) };
    }
    if (!file.type.startsWith("image/")) {
        return { key: "image.errorNotImage" };
    }
    return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
    });
}

/**
 * The `image/*` files carried by a drop or paste, in their original order.
 * An empty result means the event carries no image file and must be left to
 * ProseMirror (HTML slices, an `<img>` dragged from another tab, Word paste).
 */
export function pickImageFiles(files: FileList | File[] | null | undefined): File[] {
    if (!files) {
        return [];
    }
    return Array.from(files).filter(file => file.type.startsWith("image/"));
}
