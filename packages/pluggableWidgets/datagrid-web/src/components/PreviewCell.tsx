import { createElement, ReactElement } from "react";
import { ColumnsPreviewType } from "../../typings/DatagridProps";
import { CellComponentProps } from "../../typings/CellComponent";
import { CellElement } from "./CellElement";

export function PreviewCell(props: CellComponentProps<ColumnsPreviewType>): ReactElement {
    return (
        <CellElement
            className={props.className}
            alignment={props.column.alignment}
            wrapText={props.column.wrapText}
            borderTop={props.rowIndex === 0}
            previewAsHidden={props.column.hidable === "hidden"}
        >
            <CellContent column={props.column} />
        </CellElement>
    );
}

const dropZoneElement = <div style={{ flexGrow: 1 }} />;

function CellContent({ column }: { column: ColumnsPreviewType }): ReactElement {
    switch (column.showContentAs) {
        case "attribute":
            return (
                <span className="td-text">
                    {`[${column.attribute.length > 0 ? column.attribute : "No attribute selected"}]`}
                </span>
            );
        case "dynamicText":
            return <span className="td-text">{column.dynamicText}</span>;
        case "customContent":
            return <column.content.renderer>{dropZoneElement}</column.content.renderer>;
        default:
            return <span>Unknown content type: ${column.showContentAs}</span>;
    }
}
