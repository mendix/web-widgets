/**
 * This file was generated from Badge.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue } from "mendix";

export type TypeEnum = "badge" | "label";

export interface BadgeContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    type: TypeEnum;
    value?: DynamicValue<string>;
    onClick?: ActionValue;
}

export interface BadgePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    type: TypeEnum;
    value: string;
    onClick: {} | null;
}
