import JsBarcode from "jsbarcode";
import { type ForwardedRef, useEffect } from "react";

interface BarcodeMethodOptions {
    width?: number;
    height?: number;
    margin?: number;
    displayValue?: boolean;
}

interface BarcodeInstance {
    EAN13: (value: string, options: BarcodeMethodOptions) => BarcodeInstance;
    EAN8: (value: string, options: BarcodeMethodOptions) => BarcodeInstance;
    EAN5: (value: string, options: BarcodeMethodOptions) => BarcodeInstance;
    EAN2: (value: string, options: BarcodeMethodOptions) => BarcodeInstance;
    blank: (spacing: number) => BarcodeInstance;
    render: () => void;
    [key: string]: any;
}

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

const createBarcodeWithAddon = (
    ref: ForwardedRef<SVGSVGElement>,
    value: string,
    mainFormat: string,
    addonValue: string,
    addonFormat: string,
    options: BarcodeOptions,
    addonSpacing: number
): void => {
    if (ref && typeof ref !== "function" && ref.current) {
        const barcodeInstance = JsBarcode(ref.current) as BarcodeInstance;

        // Generate main barcode dynamically
        barcodeInstance[mainFormat](value, {
            width: options.width,
            height: options.height,
            margin: options.margin,
            displayValue: options.displayValue
        });

        // Add spacing
        barcodeInstance.blank(addonSpacing);

        // Add addon dynamically
        barcodeInstance[addonFormat](addonValue, { width: 1 });

        barcodeInstance.render();
    }
};

const createStandardBarcode = (ref: ForwardedRef<SVGSVGElement>, value: string, options: BarcodeOptions): void => {
    if (ref && typeof ref !== "function" && ref.current) {
        JsBarcode(ref.current, value, options);
    }
};

const renderBarcode = (
    ref: ForwardedRef<SVGSVGElement>,
    value: string,
    format: string,
    addonValue: string | undefined,
    addonFormat: string | undefined,
    addonSpacing: number,
    options: BarcodeOptions
): void => {
    switch (addonFormat) {
        case "EAN5":
            createBarcodeWithAddon(ref, value, format, addonValue!, addonFormat, options, addonSpacing);
            break;

        case "EAN2":
            createBarcodeWithAddon(ref, value, format, addonValue!, addonFormat, options, addonSpacing);
            break;

        default:
            createStandardBarcode(ref, value, options);
            break;
    }
};

export const useRenderBarcode = (
    ref: ForwardedRef<SVGSVGElement>,
    value: string,
    width: number,
    height: number,
    format: string,
    margin: number,
    displayValue: boolean,
    enableEan128: boolean,
    enableFlat: boolean,
    lastChar: string,
    enableMod43: boolean,
    addonValue?: string,
    addonFormat?: string,
    addonSpacing?: number
): void => {
    useEffect(() => {
        if (ref && typeof ref !== "function" && ref.current && value) {
            try {
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

                renderBarcode(ref, value, format, addonValue, addonFormat, addonSpacing || 20, options);
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
};
