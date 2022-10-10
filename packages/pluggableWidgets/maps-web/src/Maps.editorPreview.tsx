import { createElement, ReactNode } from "react";
import { MapsPreviewProps } from "../typings/MapsProps";
import { Alert } from "@mendix/pluggable-widgets-commons/components/web";
import { parseStyle } from "@mendix/pluggable-widgets-commons";

export const preview = (props: MapsPreviewProps): ReactNode => {
    return (
        <div className={props.className} style={parseStyle(props.style)}>
            {(props.mapProvider === "mapBox" || props.mapProvider === "hereMaps") && (
                <Alert bootstrapStyle="warning">
                    Provider unavailable without API Key, preview is not possible at the moment
                </Alert>
            )}
            <div className="widget-maps-preview" />
        </div>
    );
};

export function getPreviewCss(): string {
    return require("./ui/MapsPreview.scss");
}
