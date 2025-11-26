import { useBarcodeConfig } from "../config/BarcodeContext";
import { RefObject, useEffect, useRef } from "react";
import { type BarcodeRenderOptions, renderBarcode } from "../utils/barcodeRenderer-utils";

export const useRenderBarcode = (): RefObject<SVGSVGElement | null> => {
    const ref = useRef<SVGSVGElement>(null);

    const {
        value,
        width,
        height,
        format,
        margin,
        displayValue,
        addonValue,
        enableEan128,
        enableFlat,
        lastChar,
        enableMod43,
        addonFormat,
        addonSpacing
    } = useBarcodeConfig();

    useEffect(() => {
        if (ref && typeof ref !== "function" && ref.current && value) {
            try {
                const renderOptions: BarcodeRenderOptions = {
                    value,
                    format,
                    width,
                    height,
                    margin,
                    displayValue,
                    ean128: enableEan128,
                    flat: enableFlat,
                    lastChar,
                    mod43: enableMod43,
                    addonValue,
                    addonFormat,
                    addonSpacing
                };

                renderBarcode(ref, renderOptions);
            } catch (error) {
                console.error("Error generating barcode:", error);
            }
        }
    }, [value, addonValue]);

    return ref;
};
