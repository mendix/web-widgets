import { datamatrix, drawingSVG, gs1datamatrix } from "@bwip-js/browser";
import DOMPurify from "dompurify";
import { ReactElement, useMemo } from "react";
import { BarcodeGeneratorPreviewProps } from "../../../typings/BarcodeGeneratorProps";

interface DataMatrixPreviewProps extends BarcodeGeneratorPreviewProps {
    downloadButton: ReactElement | null;
}

const SAMPLE_PLAIN = "DATA MATRIX";
const SAMPLE_GS1 = "(01)09501101020917(17)261231(10)ABC123";

export function DataMatrixPreview(props: DataMatrixPreviewProps): ReactElement {
    const { downloadButton, ...restProps } = props;
    const size = restProps.dmSize ?? 128;
    const displaySize = Math.min(size, 200); // Clamped to 200px for preview
    const gs1Mode = restProps.dmGs1Mode === true;

    const svg = useMemo<string | null>(() => {
        try {
            return gs1Mode
                ? gs1datamatrix({ bcid: "gs1datamatrix", text: SAMPLE_GS1, scale: 3, parse: true }, drawingSVG())
                : datamatrix({ bcid: "datamatrix", text: SAMPLE_PLAIN, scale: 3 }, drawingSVG());
        } catch {
            return null;
        }
    }, [gs1Mode]);

    return (
        <div className="barcode-renderer datamatrix-renderer">
            {restProps.buttonPosition === "top" && downloadButton}
            {svg ? (
                <div
                    className="barcode-generator-datamatrix-preview-image"
                    style={{ width: displaySize, height: displaySize }}
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } })
                    }}
                />
            ) : (
                <div className="alert alert-danger" role="alert">
                    <strong>Data Matrix preview unavailable</strong>
                </div>
            )}
            {restProps.buttonPosition === "bottom" && downloadButton}
        </div>
    );
}
