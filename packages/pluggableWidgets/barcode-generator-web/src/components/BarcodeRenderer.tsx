import { forwardRef } from "react";
import { useRenderBarcode } from "../hooks/useRenderBarcode";

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
        useRenderBarcode(
            ref,
            value,
            width,
            height,
            format,
            margin,
            displayValue,
            enableEan128,
            enableFlat,
            lastChar,
            enableMod43,
            addonValue,
            addonFormat,
            addonSpacing
        );

        return <svg ref={ref} />;
    }
);
