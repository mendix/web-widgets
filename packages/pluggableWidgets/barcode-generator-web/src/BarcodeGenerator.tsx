import { ReactElement } from "react";
import { BarcodeGeneratorContainerProps } from "../typings/BarcodeGeneratorProps";
import { barcodeConfig } from "./config/Barcode.config";
import { BarcodeConfigProvider } from "./config/BarcodeConfigContext";
import { BarcodeGeneratorInner } from "./components/BarcodeGeneratorInner";

import "./ui/BarcodeGenerator.scss";

export default function BarcodeGenerator(props: BarcodeGeneratorContainerProps): ReactElement {
    const config = barcodeConfig(props);

    if (!config.value) {
        return <span>No barcode value provided</span>;
    }

    return (
        <BarcodeConfigProvider config={config}>
            <BarcodeGeneratorInner tabIndex={props.tabIndex} />
        </BarcodeConfigProvider>
    );
}
