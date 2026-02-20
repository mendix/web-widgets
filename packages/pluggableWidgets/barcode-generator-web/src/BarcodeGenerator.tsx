import classNames from "classnames";
import { ReactElement } from "react";
import { BarcodeGeneratorContainerProps } from "../typings/BarcodeGeneratorProps";
import { barcodeConfig } from "./config/Barcode.config";
import { QRCodeRenderer } from "./components/QRCode";
import { BarcodeRenderer } from "./components/Barcode";

import "./ui/BarcodeGenerator.scss";

export default function BarcodeGenerator(props: BarcodeGeneratorContainerProps): ReactElement {
    const config = barcodeConfig(props);

    if (!config.codeValue) {
        return <span>No barcode value provided</span>;
    }

    return (
        <div
            className={classNames(props.class, "barcode-generator", {
                "barcode-generator--as-card": props.showAsCard
            })}
            tabIndex={props.tabIndex}
            style={props.style}
        >
            {config.type === "qrcode" ? <QRCodeRenderer config={config} /> : <BarcodeRenderer config={config} />}
        </div>
    );
}
