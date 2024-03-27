/**
 * This file was generated from Events.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";
import { Big } from "big.js";

export interface EventsContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    onComponentLoad?: ActionValue;
    componentLoadDelay: number;
    componentLoadRepeat: boolean;
    componentLoadRepeatInterval: number;
    onEventChangeAttribute?: EditableValue<Big | any | boolean | Date | string>;
    onEventChange?: ActionValue;
    onEventChangeDelay: number;
}

export interface EventsPreviewProps {
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
    componentLoadRepeat: boolean;
    componentLoadRepeatInterval: number | null;
    onEventChangeAttribute: string;
    onEventChange: {} | null;
    onEventChangeDelay: number | null;
}
