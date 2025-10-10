import { createElement, ReactElement } from "react";

import { QRCodeGeneratorContainerProps } from "../typings/QRCodeGeneratorProps";

import "./ui/QRCodeGenerator.scss";

export default function QRCodeGenerator(props: QRCodeGeneratorContainerProps): ReactElement {
    const value = props.valueAttribute?.value ?? "No value";

    return (
        <div className={props.class} style={props.style} tabIndex={props.tabIndex}>
            <div className="qr-code-generator">
                <p>QR Code Generator</p>
                <p>Value: {value}</p>
            </div>
        </div>
    );
}
