import JsBarcode from "jsbarcode";
import { type ForwardedRef } from "react";

interface BarcodeMethodOptions {
    width?: number;
    height?: number;
    margin?: number;
    displayValue?: boolean;
}

interface BarcodeService {
    EAN13: (value: string, options: BarcodeMethodOptions) => BarcodeService;
    EAN8: (value: string, options: BarcodeMethodOptions) => BarcodeService;
    EAN5: (value: string, options: BarcodeMethodOptions) => BarcodeService;
    EAN2: (value: string, options: BarcodeMethodOptions) => BarcodeService;
    blank: (spacing: number) => BarcodeService;
    render: () => void;
    [key: string]: any;
}

export interface BarcodeOptions {
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

export interface BarcodeRenderOptions {
    value: string;
    format: string;
    width: number;
    height: number;
    margin: number;
    displayValue: boolean;
    ean128?: boolean;
    flat?: boolean;
    lastChar?: string;
    mod43?: boolean;
    addonValue?: string;
    addonFormat?: string;
    addonSpacing?: number;
}

/**
 * Creates a barcode with an addon (EAN2 or EAN5)
 */
export const createBarcodeWithAddon = (
    ref: ForwardedRef<SVGSVGElement>,
    value: string,
    mainFormat: string,
    addonValue: string,
    addonFormat: string,
    options: BarcodeOptions,
    addonSpacing: number
): void => {
    if (ref && typeof ref !== "function" && ref.current) {
        const BarcodeService = JsBarcode(ref.current) as BarcodeService;

        // Generate main barcode dynamically
        BarcodeService[mainFormat](value, {
            width: options.width,
            height: options.height,
            margin: options.margin,
            displayValue: options.displayValue
        });

        // Add spacing
        BarcodeService.blank(addonSpacing);

        // Add addon dynamically with same displayValue setting
        BarcodeService[addonFormat](addonValue, { width: 1, displayValue: options.displayValue });

        BarcodeService.render();
    }
};

/**
 * Creates a standard barcode without addons
 */
export const createStandardBarcode = (
    ref: ForwardedRef<SVGSVGElement>,
    value: string,
    options: BarcodeOptions
): void => {
    if (ref && typeof ref !== "function" && ref.current) {
        JsBarcode(ref.current, value, options);
    }
};

/**
 * Renders a barcode with optional addon support
 */
export const renderBarcode = (ref: ForwardedRef<SVGSVGElement>, renderOptions: BarcodeRenderOptions): void => {
    const { value, format, addonValue, addonFormat, addonSpacing = 20, ...barcodeOptions } = renderOptions;

    const options: BarcodeOptions = {
        format,
        ...barcodeOptions
    };

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
