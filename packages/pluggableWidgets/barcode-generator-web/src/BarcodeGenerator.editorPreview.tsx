import { ReactElement } from "react";
import { BarcodeGeneratorPreviewProps } from "../typings/BarcodeGeneratorProps";
import BarcodePreviewSVG from "./assets/BarcodeGeneratorPreview.svg";

export function preview(_props: BarcodeGeneratorPreviewProps): ReactElement {
    const doc = decodeURI(BarcodePreviewSVG);

    return (
        <div className="barcode-generator-widget-preview">
            <img src={doc} alt="" />
        </div>
    );
}
