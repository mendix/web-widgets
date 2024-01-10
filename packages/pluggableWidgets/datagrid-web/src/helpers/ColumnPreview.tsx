import { createElement, ReactElement } from "react";
import { ColumnsPreviewType } from "../../typings/DatagridProps";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { BaseColumn } from "./ColumnBase";

export class ColumnPreview extends BaseColumn implements GridColumn {
    private props: ColumnsPreviewType;

    columnNumber: number;
    visible: boolean;

    constructor(props: ColumnsPreviewType, columnNumber: number) {
        super(props);

        this.props = props;
        this.columnNumber = columnNumber;

        this.visible = props.visible === "true";
    }

    columnClass(_item?: unknown): string | undefined {
        return undefined;
    }
    get columnId(): ColumnId {
        return this.columnNumber.toString() as ColumnId;
    }
    get header(): string {
        return (this.props.header?.trim().length ?? 0) === 0 ? "[Empty caption]" : this.props.header;
    }
    renderCellContent(_item?: unknown): ReactElement {
        switch (this.props.showContentAs) {
            case "attribute":
                return (
                    <span className="td-text">
                        {`[${this.props.attribute.length > 0 ? this.props.attribute : "No attribute selected"}]`}
                    </span>
                );
            case "dynamicText":
                return <span className="td-text">{this.props.dynamicText}</span>;
            case "customContent":
                const Content = this.props.content.renderer;

                return (
                    <Content>
                        <div style={{ flexGrow: 1 }} />
                    </Content>
                );
            default:
                return <span>Unknown content type: ${this.props.showContentAs}</span>;
        }
    }
}
