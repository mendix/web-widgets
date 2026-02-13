import { BarcodeTypeConfig } from "../config/Barcode.config";
import { RefObject, useEffect, useRef, useState } from "react";
import { type BarcodeRenderOptions, renderBarcode } from "../utils/barcodeRenderer-utils";
import { validateAddonValue, validateBarcodeValue } from "../config/validation";

export const useRenderBarcode = (
    config: BarcodeTypeConfig
): { ref: RefObject<SVGSVGElement | null>; error: string | null } => {
    const ref = useRef<SVGSVGElement>(null);
    const [error, setError] = useState<string | null>(null);

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
            // Validate barcode value at runtime
            const validationResult = validateBarcodeValue(format, value);
            if (!validationResult.valid) {
                setError(validationResult.message || "Invalid barcode value");
                return;
            }

            // Validate addon if present
            if (addonValue && addonFormat && addonFormat !== "None") {
                const addonResult = validateAddonValue(addonFormat, addonValue);
                if (!addonResult.valid) {
                    setError(addonResult.message || "Invalid addon value");
                    return;
                }
            }

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
                setError(null); // Clear any previous errors
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : "Error generating barcode";
                setError(errorMsg);
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

    return { ref, error };
};
