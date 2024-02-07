/**
 * This file was generated from AppEvents.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";
import { Big } from "big.js";

export interface AppEventsContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    onPageLoad?: ActionValue;
    pageLoadDelay: number;
    onPageUnload?: ActionValue;
    pageUnloadDelay: number;
    attributeEvent?: EditableValue<Big | any | boolean | Date | string>;
    onAttributeEventChange?: ActionValue;
    onAttributeEventChangeDelay: number;
}

export interface AppEventsPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    onPageLoad: {} | null;
    pageLoadDelay: number | null;
    onPageUnload: {} | null;
    pageUnloadDelay: number | null;
    attributeEvent: string;
    onAttributeEventChange: {} | null;
    onAttributeEventChangeDelay: number | null;
}
