import JsBarcode from "jsbarcode";
import { forwardRef, useEffect } from "react";

interface BarcodeRendererProps {
    value: string;
    width: number;
    height: number;
    format: string;
    margin: number;
    displayValue: boolean;
}

export const BarcodeRenderer = forwardRef<SVGSVGElement, BarcodeRendererProps>(
    ({ value, width, height, format, margin, displayValue }, ref) => {
        useEffect(() => {
            if (ref && typeof ref !== "function" && ref.current && value) {
                try {
                    JsBarcode(ref.current, value, {
                        format,
                        width,
                        height,
                        margin,
                        displayValue
                    });
                } catch (error) {
                    console.error("Error generating barcode:", error);
                }
            }
        }, [value, width, height, format, margin, displayValue, ref]);

        return <svg ref={ref} />;
    }
);
