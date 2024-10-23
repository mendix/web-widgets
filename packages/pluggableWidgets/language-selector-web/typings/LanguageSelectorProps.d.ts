/**
 * This file was generated from LanguageSelector.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, ListValue, ListExpressionValue } from "mendix";

export type PositionEnum = "left" | "right" | "top" | "bottom";

export type TriggerEnum = "click" | "hover";

export interface LanguageSelectorContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    languageOptions: ListValue;
    languageCaption: ListExpressionValue<string>;
    position: PositionEnum;
    trigger: TriggerEnum;
    hideForSingle: boolean;
    screenReaderLabelCaption?: DynamicValue<string>;
}

export interface LanguageSelectorPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    languageOptions: {} | { caption: string } | { type: string } | null;
    languageCaption: string;
    position: PositionEnum;
    trigger: TriggerEnum;
    hideForSingle: boolean;
    screenReaderLabelCaption: string;
}
