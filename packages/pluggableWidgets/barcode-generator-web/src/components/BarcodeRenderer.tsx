import JsBarcode from "jsbarcode";
import { forwardRef, useEffect } from "react";

interface BarcodeOptions {
    format: string;
    width: number;
    height: number;
    margin: number;
    displayValue: boolean;
    ean128?: boolean;
    flat?: boolean;
    lastChar?: string;
    mod43?: boolean;
}

interface BarcodeRendererProps {
    value: string;
    width: number;
    height: number;
    format: string;
    margin: number;
    displayValue: boolean;
    enableEan128: boolean;
    enableFlat: boolean;
    lastChar: string;
    enableMod43: boolean;
    addonValue?: string;
    addonFormat?: string;
    addonSpacing?: number;
}

export const BarcodeRenderer = forwardRef<SVGSVGElement, BarcodeRendererProps>(
    (
        {
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
        },
        ref
    ) => {
        useEffect(() => {
            if (ref && typeof ref !== "function" && ref.current && value) {
                try {
                    // Check if format supports addons and addon data is provided
                    const supportsAddon =
                        addonValue &&
                        (format === "EAN13" || format === "EAN8") &&
                        (addonFormat === "EAN5" || addonFormat === "EAN2");

                    if (supportsAddon) {
                        const barcodeInstance = JsBarcode(ref.current);

                        // Generate main barcode
                        if (format === "EAN13") {
                            barcodeInstance.EAN13(value, {
                                width,
                                height,
                                margin,
                                displayValue
                            });
                        } else if (format === "EAN8") {
                            barcodeInstance.EAN8(value, {
                                width,
                                height,
                                margin,
                                displayValue
                            });
                        }

                        // Add spacing
                        barcodeInstance.blank(addonSpacing || 20);

                        // Add addon
                        if (addonFormat === "EAN5") {
                            barcodeInstance.EAN5(addonValue, {
                                width: 1
                            });
                        } else if (addonFormat === "EAN2") {
                            barcodeInstance.EAN2(addonValue, {
                                width: 1
                            });
                        }
                        barcodeInstance.render();
                    } else {
                        // Standard single barcode generation
                        const options: BarcodeOptions = {
                            format,
                            width,
                            height,
                            margin,
                            displayValue,
                            ean128: enableEan128,
                            flat: enableFlat,
                            lastChar,
                            mod43: enableMod43
                        };

                        JsBarcode(ref.current, value, options);
                    }
                } catch (error) {
                    console.error("Error generating barcode:", error);
                }
            }
        }, [
            value,
            width,
            height,
            format,
            margin,
            displayValue,
            enableEan128,
            enableFlat,
            enableMod43,
            lastChar,
            addonValue,
            addonFormat,
            addonSpacing,
            ref
        ]);

        return <svg ref={ref} />;
    }
);
