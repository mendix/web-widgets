/**
 * This file was generated from AppEvents.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue } from "mendix";

export interface AppEventsContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    onPageLoad?: ActionValue;
    pageLoadDelay: number;
    onPageUnload?: ActionValue;
    pageUnloadDelay: number;
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
}
