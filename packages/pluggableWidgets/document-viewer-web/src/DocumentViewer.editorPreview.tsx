import { createElement, ReactElement } from "react";
import { DocumentViewerPreviewProps } from "typings/DocumentViewerProps";
import "../ui/documentViewer.scss";
import "../ui/documentViewerIcons.scss";
import classNames from "classnames";
import { constructWrapperStyle } from "../utils/dimension";
import { BaseControlViewer } from "components/BaseViewer";

export const preview = (props: DocumentViewerPreviewProps): ReactElement => {
    const { file } = props;
    const wrapperStyle = constructWrapperStyle({
        widthUnit: props.widthUnit,
        width: props.width ?? 100,
        heightUnit: props.heightUnit,
        height: props.height ?? 250,
        minHeightUnit: props.minHeightUnit,
        minHeight: props.minHeight ?? 250,
        maxHeightUnit: props.maxHeightUnit,
        maxHeight: props.maxHeight ?? 500,
        overflowY: props.overflowY
    });
    return (
        <div className={classNames(props.class, "widget-document-viewer", "form-control")} style={wrapperStyle}>
            <BaseControlViewer
                file={{
                    status: "available",
                    value: {
                        uri: file,
                        name: file
                    }
                }}
            >
                {file}
            </BaseControlViewer>
        </div>
    );
};
