import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import SignaturePad, { Options } from "signature_pad";
import { SignatureProps } from "./customTypes";

export function useSignaturePad(
    props: Pick<SignatureProps, "readOnly" | "imageSource" | "hasSignatureAttribute" | "penType" | "penColor">,
    onSignEnd?: (imageDataURL?: string) => void
): {
    signaturePadRef: RefObject<SignaturePad | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
} {
    const { readOnly, imageSource, hasSignatureAttribute, penType, penColor } = props;
    const signaturePadRef = useRef<SignaturePad | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const hasSignature = useRef(false);

    useEffect(() => {
        if (readOnly) {
            signaturePadRef.current?.off();
        } else {
            signaturePadRef.current?.on();
        }
    }, [readOnly]);

    useEffect(() => {
        if (imageSource?.status === "available" && imageSource.value?.uri && signaturePadRef.current?.isEmpty()) {
            signaturePadRef.current?.fromDataURL(imageSource.value.uri);
        }
    }, [imageSource]);

    useEffect(() => {
        if (hasSignatureAttribute?.status === "available") {
            if (hasSignatureAttribute?.value !== hasSignature.current) {
                if (hasSignature.current === true) {
                    signaturePadRef.current?.clear();
                }
                hasSignature.current = !!hasSignatureAttribute?.value;
            }
        }
    }, [hasSignatureAttribute?.status, hasSignatureAttribute?.value]);

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

        if (imageDataUrl && onSignEnd) {
            onSignEnd(imageDataUrl);
        }
    }, [onSignEnd]);

    useEffect(() => {
        if (canvasRef.current) {
            signaturePadRef.current = new SignaturePad(canvasRef.current, {
                penColor,
                ...signaturePadOptions
            });
            signaturePadRef.current.addEventListener("endStroke", handleSignEnd);
            if (readOnly) {
                signaturePadRef.current?.off();
            }
        }
    }, [handleSignEnd, penColor, readOnly, signaturePadOptions]);

    return { signaturePadRef, canvasRef };
}
