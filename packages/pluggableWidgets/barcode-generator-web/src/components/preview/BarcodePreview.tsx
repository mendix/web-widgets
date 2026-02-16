import { ReactElement } from "react";
import { BarcodeGeneratorPreviewProps } from "../../../typings/BarcodeGeneratorProps";
import { useBarcodePreviewSvg } from "../../hooks/useBarcodePreviewSvg";

interface BarcodePreviewProps extends BarcodeGeneratorPreviewProps {
    downloadButton: ReactElement | null;
}

export function BarcodePreview(props: BarcodePreviewProps): ReactElement {
    const { downloadButton, ...restProps } = props;
    const codeHeight = restProps.codeHeight ?? 200;
    const displayHeight = Math.min(codeHeight, 400); // Clamped to 400px for preview

    const { imageUrl, displayUrl } = useBarcodePreviewSvg({
        codeFormat: restProps.codeFormat,
        customCodeFormat: restProps.customCodeFormat,
        addonFormat: restProps.addonFormat,
        enableFlat: restProps.enableFlat === true,
        displayValue: restProps.displayValue
    });

    return (
        <div className="barcode-renderer">
            {restProps.buttonPosition === "top" && downloadButton}
            <div className="barcode-preview-barcode-container" style={{ height: displayHeight }}>
                {imageUrl ? (
                    <img
                        className="barcode-preview-graphic barcode-preview-graphic--barcode"
                        src={displayUrl ?? imageUrl}
                        alt="Barcode preview"
                        style={{ height: "100%", width: "auto" }}
                    />
                ) : (
                    <div className="barcode-preview-error">Barcode format not supported</div>
                )}
            </div>
            {restProps.buttonPosition === "bottom" && downloadButton}
        </div>
    );
}
