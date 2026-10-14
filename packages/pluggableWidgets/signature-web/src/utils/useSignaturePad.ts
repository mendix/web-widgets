import { RefObject, useCallback, useEffect, useRef } from "react";
import SignaturePad, { Options } from "signature_pad";
import { useResizeObserver } from "@mendix/widget-plugin-hooks/useResizeObserver";
import { PenTypeEnum, SignatureContainerProps } from "../../typings/SignatureProps";

export function useSignaturePad(
    props: Pick<SignatureContainerProps, "imageSource" | "hasSignatureAttribute" | "penType" | "penColor">,
    onSignEnd?: (imageDataURL?: string) => void
): {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    containerRef: RefObject<HTMLDivElement | null>;
} {
    const { imageSource, hasSignatureAttribute, penType, penColor } = props;
    const readOnly = imageSource.readOnly;
    const signaturePadRef = useRef<SignaturePad | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const hasSignature = usePrevious<boolean>(hasSignatureAttribute?.value ?? false) ?? false;

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

    const handleResize = useCallback(
        (element: HTMLDivElement) => {
            const pad = signaturePadRef.current;
            const canvas = canvasRef.current;
            if (pad && canvas) {
                // off()+on() resets _drawingStroke and clears stale pointer/move listeners,
                // preventing pointerdown from being silently dropped after a mid-stroke resize.
                pad.off();
                canvas.width = element.offsetWidth;
                canvas.height = element.offsetHeight;
                pad.redraw();
                if (!readOnly) {
                    pad.on();
                }
            }
        },
        [readOnly]
    );

    const containerRef = useResizeObserver(handleResize) as RefObject<HTMLDivElement | null>;

    // Clear signature pad when hasSignature value changes from true to false
    useEffect(() => {
        if (hasSignatureAttribute?.status === "available" && hasSignature && hasSignatureAttribute.value === false) {
            signaturePadRef.current?.clear();
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
            if (canInstantiateSignaturePad) {
                const container = containerRef.current;
                if (container) {
                    localCanvas.width = container.offsetWidth;
                    localCanvas.height = container.offsetHeight;
                }
                signaturePadRef.current = new SignaturePad(localCanvas, { penColor, ...getPenOptions(penType) });
                signaturePadRef.current.addEventListener("endStroke", handleSignEnd);
                if (readOnly) {
                    signaturePadRef.current.off();
                }
            }
        }
    }, [handleSignEnd, penColor, penType, readOnly, imageSource, hasSignatureAttribute, containerRef]);

    return { canvasRef, containerRef };
}

const PEN_OPTIONS: Record<PenTypeEnum, Options> = {
    fountain: { minWidth: 0.6, maxWidth: 2.6, velocityFilterWeight: 0.6 },
    ballpoint: { minWidth: 1.4, maxWidth: 1.5, velocityFilterWeight: 1.5 },
    marker: { minWidth: 2, maxWidth: 4, velocityFilterWeight: 0.9 }
};

function getPenOptions(penType: PenTypeEnum): Options {
    return PEN_OPTIONS[penType];
}

function usePrevious<T>(value: T): T | null {
    const ref = useRef<T>(null);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}
