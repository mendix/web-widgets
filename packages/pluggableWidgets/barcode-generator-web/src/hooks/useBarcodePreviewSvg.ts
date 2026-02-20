import { useEffect, useMemo, useState } from "react";
import { getBarcodeImageUrl } from "../assets/barcodePreview.assets";

type UseBarcodePreviewSvgOptions = {
    codeFormat: string;
    customCodeFormat: string;
    addonFormat: string;
    enableFlat: boolean;
    displayValue?: boolean;
};

type UseBarcodePreviewSvgResult = {
    imageUrl: string | null;
    displayUrl: string | null;
};

export function useBarcodePreviewSvg(options: UseBarcodePreviewSvgOptions): UseBarcodePreviewSvgResult {
    const imageUrl = useMemo(
        () => getBarcodeImageUrl(options.codeFormat, options.customCodeFormat, options.addonFormat, options.enableFlat),
        [options.codeFormat, options.customCodeFormat, options.addonFormat, options.enableFlat]
    );

    const [modifiedSvgUrl, setModifiedSvgUrl] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        if (!imageUrl) {
            setModifiedSvgUrl(null);
            return () => {
                active = false;
            };
        }

        if (options.displayValue === true) {
            setModifiedSvgUrl(null);
            return () => {
                active = false;
            };
        }

        fetch(imageUrl)
            .then(response => response.text())
            .then(svgText => {
                if (!active) return;
                const modifiedSvg = conditionallyModifySVG(svgText, false);
                setModifiedSvgUrl(svgToDataUri(modifiedSvg));
            })
            .catch(() => {
                if (active) {
                    setModifiedSvgUrl(null);
                }
            });

        return () => {
            active = false;
        };
    }, [imageUrl, options.displayValue]);

    return {
        imageUrl,
        displayUrl: modifiedSvgUrl ?? imageUrl
    };
}

function conditionallyModifySVG(svgString: string, showText: boolean): string {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, "image/svg+xml");

        if (doc.getElementsByTagName("parsererror").length > 0) {
            return svgString;
        }

        const textElements = doc.querySelectorAll("text");
        textElements.forEach(text => {
            text.style.display = showText ? "block" : "none";
        });

        return new XMLSerializer().serializeToString(doc);
    } catch {
        return svgString;
    }
}

function svgToDataUri(svgString: string): string {
    try {
        const encodedSvg = encodeURIComponent(svgString);
        return `data:image/svg+xml;charset=UTF-8,${encodedSvg}`;
    } catch {
        return "";
    }
}
