import { ReactElement } from "react";
import { BarcodeGeneratorContainerProps } from "../typings/BarcodeGeneratorProps";
import { barcodeConfig } from "./config/Barcode.config";
import { BarcodeContextProvider, useBarcodeConfig } from "./config/BarcodeContext";
import { QRCodeRenderer } from "./components/QRCode";
import { BarcodeRenderer } from "./components/Barcode";

import "./ui/BarcodeGenerator.scss";

function BarcodeContainer({ tabIndex }: { tabIndex?: number }): ReactElement {
    const config = useBarcodeConfig();

    return (
        <div className="barcode-generator" tabIndex={tabIndex}>
            {config.isQRCode ? <QRCodeRenderer /> : <BarcodeRenderer />}
        </div>
    );
}

export default function BarcodeGenerator(props: BarcodeGeneratorContainerProps): ReactElement {
    const config = barcodeConfig(props);

    if (!config.value) {
        return <span>No barcode value provided</span>;
    }

    return (
        <BarcodeContextProvider config={config}>
            <BarcodeContainer tabIndex={props.tabIndex} />
        </BarcodeContextProvider>
    );
}
