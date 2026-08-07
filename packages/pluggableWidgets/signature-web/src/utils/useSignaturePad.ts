import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import SignaturePad, { Options } from "signature_pad";
import { SignatureContainerProps } from "../../typings/SignatureProps";

function usePrevious<T>(value: T): T | null {
    const ref = useRef<T>(null);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

export function useSignaturePad(
    props: Pick<SignatureContainerProps, "imageSource" | "hasSignatureAttribute" | "penType" | "penColor">,
    onSignEnd?: (imageDataURL?: string) => void
): {
    signaturePadRef: RefObject<SignaturePad | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onResize?: () => void;
} {
    const { imageSource, hasSignatureAttribute, penType, penColor } = props;
    const readOnly = imageSource.readOnly;
    const signaturePadRef = useRef<SignaturePad | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isSignatureInitialized = useRef(false);
    const hasSignature = usePrevious<boolean>(hasSignatureAttribute?.value ?? false) ?? false;

    const signaturePadOptions: Options = useMemo(() => {
        let options: Options = {};
        if (penType === "fountain") {
            options = { minWidth: 0.6, maxWidth: 2.6, velocityFilterWeight: 0.6 };
        } else if (penType === "ballpoint") {
            options = { minWidth: 1.4, maxWidth: 1.5, velocityFilterWeight: 1.5 };
        } else if (penType === "marker") {
            options = { minWidth: 2, maxWidth: 4, velocityFilterWeight: 0.9 };
        }
        return options;
    }, [penType]);

    const handleSignEnd = useCallback(() => {
        const imageDataUrl = signaturePadRef.current?.toDataURL();

        if (hasSignatureAttribute) {
            hasSignatureAttribute.setValue(!signaturePadRef.current?.isEmpty());
        }
        if (imageDataUrl && onSignEnd) {
            onSignEnd(imageDataUrl);
        }
    }, [hasSignatureAttribute, onSignEnd]);

    // Toggle readonly condition on signature pad when imageSource.readOnly changes
    useEffect(() => {
        if (readOnly) {
            signaturePadRef.current?.off();
        } else {
            signaturePadRef.current?.on();
        }
    }, [readOnly]);

    const onResize = (): void => {
        const pad = signaturePadRef.current;
        const canvas = canvasRef.current;
        if (pad && canvas) {
            const data = pad.toData();
            // off()+on() resets _drawingStroke and clears stale pointer/move listeners,
            // preventing pointerdown from being silently dropped after a mid-stroke resize.
            pad.off();
            canvas.width = canvas.parentElement?.offsetWidth ?? 0;
            canvas.height = canvas.parentElement?.offsetHeight ?? 0;
            pad.clear();
            pad.fromData(data);
            if (!readOnly) {
                pad.on();
            }
        }
    };

    // Clear signature pad when hasSignature value changes from true to false
    useEffect(() => {
        if (hasSignatureAttribute?.status === "available") {
            if (hasSignatureAttribute?.value !== hasSignature) {
                if (hasSignature === true) {
                    signaturePadRef.current?.clear();
                }
            }
        }
    }, [hasSignature, hasSignatureAttribute?.status, hasSignatureAttribute?.value]);

    // Initialize signature pad
    useEffect(() => {
        const localCanvas = canvasRef.current;
        if (localCanvas) {
            // only instantiate when all data is loaded properly to avoid unnecessary re-instantiations
            const canInstantiateSignaturePad =
                signaturePadRef.current === null &&
                (imageSource?.status === "available" ? imageSource.value?.uri : imageSource.status === "unavailable");
            if (canInstantiateSignaturePad && !isSignatureInitialized.current) {
                // Set canvas dimensions to the actual parent size before initializing the pad.
                // ResizeObserver may have already fired and been a no-op (pad was null then),
                // so we can't rely on onResize to set the correct initial size.
                if (localCanvas.parentElement) {
                    localCanvas.width = localCanvas.parentElement.offsetWidth;
                    localCanvas.height = localCanvas.parentElement.offsetHeight;
                }
                signaturePadRef.current = new SignaturePad(localCanvas, {
                    penColor,
                    ...signaturePadOptions
                });
                signaturePadRef.current.addEventListener("endStroke", handleSignEnd);
                if (readOnly) {
                    signaturePadRef.current?.off();
                }
                isSignatureInitialized.current = true;
            }
        }
    }, [handleSignEnd, penColor, readOnly, signaturePadOptions, imageSource, hasSignatureAttribute]);

    return { signaturePadRef, canvasRef, onResize };
}
