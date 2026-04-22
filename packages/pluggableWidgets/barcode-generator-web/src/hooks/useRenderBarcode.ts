import { RefObject, useEffect, useRef, useState } from "react";
import { BarcodeTypeConfig } from "../config/Barcode.config";
import { validateAddonValue, validateBarcodeValue } from "../config/validation";
import { type BarcodeRenderOptions, renderBarcode } from "../utils/barcodeRenderer-utils";
import { printError } from "../utils/helpers";

export const useRenderBarcode = (
    config: BarcodeTypeConfig
): { ref: RefObject<SVGSVGElement | null>; error: boolean } => {
    const ref = useRef<SVGSVGElement>(null);
    const [error, setError] = useState<boolean>(false);

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
            // Reset error state at the start of each render attempt
            setError(false);

            // Validate barcode value at runtime
            const validationResult = validateBarcodeValue(format, value);
            if (!validationResult.valid) {
                const errorMsg = validationResult.message;
                // Log detailed error for developers

                printError(
                    `Validation failed for format "${format}": ${errorMsg} \nProvided value: "${value}"`,
                    config.logLevel
                );
                setError(true);
                return;
            }

            // Validate addon if present
            if (addonValue && addonFormat && addonFormat !== "None") {
                const addonResult = validateAddonValue(addonFormat, addonValue);
                if (!addonResult.valid) {
                    const errorMsg = addonResult.message;
                    // Log detailed error for developers
                    printError(
                        `Addon validation failed for format "${addonFormat}": ${errorMsg} \nProvided addon value: "${addonValue}"`,
                        config.logLevel
                    );
                    setError(true);
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
                setError(false); // Clear any previous errors
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : "Error generating barcode";
                // Log detailed error for developers
                printError(`Rendering failed: ${errorMsg} \nFormat: "${format}" \nValue: "${value}"`, config.logLevel);
                setError(true);
            }
        } else if (!value) {
            // Clear error if value becomes empty
            setError(false);
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
        addonSpacing,
        config.logLevel
    ]);

    return { ref, error };
};
