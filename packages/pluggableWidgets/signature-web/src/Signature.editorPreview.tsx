import classNames from "classnames";
import { ReactElement } from "react";
import { SignaturePreviewProps } from "../typings/SignatureProps";
import { Grid } from "./components/Grid";
import { SizeContainer } from "./components/SizeContainer";

export function preview(props: SignaturePreviewProps): ReactElement {
    const {
        widthUnit,
        width,
        heightUnit,
        height,
        minHeightUnit,
        minHeight,
        maxHeightUnit,
        maxHeight,
        overflowY,
        gridBorderColor,
        gridBorderWidth,
        gridCellHeight,
        gridCellWidth
    } = props;
    return (
        <SizeContainer
            className={classNames("widget-signature-preview", props.class)}
            widthUnit={widthUnit}
            width={width || 100}
            heightUnit={heightUnit}
            height={height || 250}
            minHeightUnit={minHeightUnit}
            minHeight={minHeight || 250}
            maxHeightUnit={maxHeightUnit}
            maxHeight={maxHeight || 250}
            overflowY={overflowY}
        >
            <Grid
                gridBorderColor={gridBorderColor || "#000000"}
                gridBorderWidth={gridBorderWidth || 50}
                gridCellHeight={gridCellHeight || 50}
                gridCellWidth={gridCellWidth || 50}
            />
            <div className="size-box-inner">{"Signature"}</div>
        </SizeContainer>
    );
}

export function getPreviewCss(): string {
    return require("./ui/SignaturePreview.scss");
}
