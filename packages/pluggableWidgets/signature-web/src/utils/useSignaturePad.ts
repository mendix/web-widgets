import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import SignaturePad, { Options } from "signature_pad";
import { SignatureProps } from "./customTypes";

function usePrevious<T>(value: T): T | null {
    const ref = useRef<T>(null);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

export function useSignaturePad(
    props: Pick<SignatureProps, "imageSource" | "hasSignatureAttribute" | "penType" | "penColor">,
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
        if (canvasRef.current && signaturePadRef.current) {
            const data = signaturePadRef.current.toData();
            canvasRef.current.width =
                canvasRef.current && canvasRef.current.parentElement ? canvasRef.current.parentElement.offsetWidth : 0;
            canvasRef.current.height =
                canvasRef.current && canvasRef.current.parentElement ? canvasRef.current.parentElement.offsetHeight : 0;
            signaturePadRef.current.clear();
            signaturePadRef.current.fromData(data);
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
        if (canvasRef.current) {
            // only instantiate when all data is loaded properly to avoid unnecessary re-instantiations
            const canInstantiateSignaturePad =
                signaturePadRef.current === null &&
                (imageSource?.status === "available" ? imageSource.value?.uri : imageSource.status === "unavailable");
            if (canInstantiateSignaturePad && !isSignatureInitialized.current) {
                signaturePadRef.current = new SignaturePad(canvasRef.current, {
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
