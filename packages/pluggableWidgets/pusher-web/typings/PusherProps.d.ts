/**
 * This file was generated from Pusher.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, ObjectItem } from "mendix";
import { CSSProperties } from "react";

export interface PusherContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    objectSource: DynamicValue<ObjectItem>;
    notifyActionName: string;
    notifyEventAction?: ActionValue;
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
    notifyActionName: string;
    notifyEventAction: {} | null;
}
