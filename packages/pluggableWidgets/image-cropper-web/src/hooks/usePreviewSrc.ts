import { useCallback, useEffect, useRef, useState } from "react";

interface PreviewSrc {
    // A local blob: URL to display instead of the bound uri, or undefined to use the bound uri.
    previewSrc: string | undefined;
    // Show a baked File immediately (before the deferred commit changes the bound uri).
    showPreview: (file: File) => void;
}

// Bridges the gap between an in-memory baked File (e.g. a rotation) and the Mendix
// deferred-commit model: setValue stages the file but the bound uri only changes on
// Save. We mint a blob: URL so the edit is visible right away, then drop it once the
// real commit produces a new uri.
export function usePreviewSrc(committedUri: string | undefined): PreviewSrc {
    const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);
    const blobRef = useRef<string | undefined>(undefined);
    const prevUri = useRef(committedUri);

    const revoke = useCallback(() => {
        if (blobRef.current) {
            URL.revokeObjectURL(blobRef.current);
            blobRef.current = undefined;
        }
    }, []);

    const showPreview = useCallback(
        (file: File) => {
            revoke();
            const url = URL.createObjectURL(file);
            blobRef.current = url;
            setPreviewSrc(url);
        },
        [revoke]
    );

    // A new committed uri means the bound value caught up (or was replaced externally):
    // discard the local preview and fall back to the bound uri.
    if (prevUri.current !== committedUri) {
        prevUri.current = committedUri;
        if (blobRef.current) {
            revoke();
            setPreviewSrc(undefined);
        }
    }

    useEffect(() => revoke, [revoke]);

    return { previewSrc, showPreview };
}
