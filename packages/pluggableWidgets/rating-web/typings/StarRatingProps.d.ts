/**
 * This file was generated from StarRating.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, WebIcon } from "mendix";
import { Big } from "big.js";

export interface StarRatingContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    rateAttribute: EditableValue<Big>;
    emptyIcon?: DynamicValue<WebIcon>;
    icon?: DynamicValue<WebIcon>;
    maximumStars: number;
    animation: boolean;
    onChange?: ActionValue;
}

export interface StarRatingPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    rateAttribute: string;
    emptyIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    maximumStars: number | null;
    animation: boolean;
    onChange: {} | null;
}
