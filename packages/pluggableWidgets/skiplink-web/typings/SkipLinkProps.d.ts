/**
 * This file was generated from SkipLink.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";

export interface SkipLinkContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    linkText: string;
    mainContentId: string;
}

export interface SkipLinkPreviewProps {
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
    linkText: string;
    mainContentId: string;
}
