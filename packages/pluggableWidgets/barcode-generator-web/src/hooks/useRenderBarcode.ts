import { BarcodeTypeConfig } from "../config/Barcode.config";
import { RefObject, useEffect, useRef } from "react";
import { type BarcodeRenderOptions, renderBarcode } from "../utils/barcodeRenderer-utils";

export const useRenderBarcode = (config: BarcodeTypeConfig): RefObject<SVGSVGElement | null> => {
    const ref = useRef<SVGSVGElement>(null);

    const {
        codeValue: value,
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
    } = config;

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
    }, [
        value,
        format,
        width,
        height,
        margin,
        displayValue,
        enableEan128,
        enableFlat,
        lastChar,
        enableMod43,
        addonValue,
        addonFormat,
        addonSpacing
    ]);

    return ref;
};
