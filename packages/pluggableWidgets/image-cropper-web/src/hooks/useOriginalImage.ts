import { useCallback, useEffect, useRef, useState } from "react";

interface OriginalImage {
    getOriginal: () => File | undefined;
    canRestore: boolean;
    markInternalChange: () => void;
}

// Capture the original image bytes on first load so Reset can restore them
// after auto-apply has overwritten the bound attribute. Eager fetch is the
// accepted cost for robustness against blob: URL revocation.
export function useOriginalImage(uri: string | undefined, name: string | undefined): OriginalImage {
    const fileRef = useRef<File | undefined>(undefined);
    const [canRestore, setCanRestore] = useState(false);
    const capturedUri = useRef<string | undefined>(undefined);
    const internalChange = useRef(false);

    // Stable setter: called by the container before every internal setValue so
    // the next uri change is skipped without recapturing our own baked output.
    const markInternalChange = useCallback(() => {
        internalChange.current = true;
    }, []);

    useEffect(() => {
        if (!uri || capturedUri.current === uri) {
            return;
        }
        // Our own bake produced this new uri — adopt it, keep the original, skip fetch.
        if (internalChange.current) {
            capturedUri.current = uri;
            internalChange.current = false;
            return;
        }
        capturedUri.current = uri;
        fileRef.current = undefined;
        setCanRestore(false);
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(uri);
                if (!res.ok) {
                    throw new Error(`status ${res.status}`);
                }
                const blob = await res.blob();
                if (cancelled) {
                    return;
                }
                fileRef.current = new File([blob], name ?? "original", { type: blob.type || "image/png" });
                setCanRestore(true);
            } catch {
                // fetch failed: degrade to no-restore
                if (!cancelled) {
                    setCanRestore(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [uri, name]);

    return {
        getOriginal: () => fileRef.current,
        canRestore,
        markInternalChange
    };
}
