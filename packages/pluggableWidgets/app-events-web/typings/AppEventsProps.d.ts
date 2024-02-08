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
    onComponentLoad?: ActionValue;
    componentLoadDelay: number;
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
    onComponentLoad: {} | null;
    componentLoadDelay: number | null;
    attributeEvent: string;
    onAttributeEventChange: {} | null;
    onAttributeEventChangeDelay: number | null;
}
