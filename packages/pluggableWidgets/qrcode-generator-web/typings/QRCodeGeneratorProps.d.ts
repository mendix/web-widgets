/**
 * This file was generated from QRCodeGenerator.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

export interface QRCodeGeneratorContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    qrValue: EditableValue<string>;
    qrSize: number;
    qrMargin: number;
}

export interface QRCodeGeneratorPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    qrValue: string;
    qrSize: number | null;
    qrMargin: number | null;
}
