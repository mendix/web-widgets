/**
 * This file was generated from AppEvents.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";

export type OptionsSourceTypeEnum = "association" | "enumeration" | "boolean";

export interface AppEventsContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    optionsSourceType: OptionsSourceTypeEnum;
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
    optionsSourceType: OptionsSourceTypeEnum;
}
