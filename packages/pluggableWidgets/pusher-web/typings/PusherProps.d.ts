/**
 * This file was generated from Pusher.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, ListValue } from "mendix";

export interface PusherContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    objectSource: ListValue;
    notifyChannelName: string;
    notifyAction?: ActionValue;
}

export interface PusherPreviewProps {
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
    objectSource: {} | { caption: string } | { type: string } | null;
    notifyChannelName: string;
    notifyAction: {} | null;
}
