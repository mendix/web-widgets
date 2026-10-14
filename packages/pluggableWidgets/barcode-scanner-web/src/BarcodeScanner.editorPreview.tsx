import { ReactElement } from "react";
import { BarcodeScannerPreviewProps } from "../typings/BarcodeScannerProps";
import previewQrCodeSvg from "./assets/previewQrCode.svg";
import { BarcodeScannerOverlay } from "./components/BarcodeScanner";

export function preview(props: BarcodeScannerPreviewProps): ReactElement {
    return (
        <BarcodeScannerOverlay
            showMask={props.showMask}
            class={props.className}
            heightUnit={props.heightUnit}
            widthUnit={props.widthUnit}
            // These are set by default values in widget properties.
            height={props.height!}
            width={props.width!}
        >
            <img src={previewQrCodeSvg} className="design-preview-qr-code" />
        </BarcodeScannerOverlay>
    );
}

export function getPreviewCss(): string {
    return require("./ui/BarcodeScannerPreview.scss");
}
