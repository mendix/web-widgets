import { createElement, ReactElement } from "react";
import { AlignmentEnum, ColumnsPreviewType, HidableEnum, WidthEnum } from "../../typings/DatagridProps";
import { GridColumn } from "../typings/GridColumn";

export class ColumnPreview implements GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;
    canHide: boolean;
    canResize: boolean;
    columnNumber: number;
    hidable: HidableEnum;
    hidden: boolean;
    supress: boolean;
    weight: number;
    width: WidthEnum;
    wrapText: boolean;

    private gridId: string;
    private props: ColumnsPreviewType;

    constructor(props: ColumnsPreviewType, columnNumber: number, gridId: string) {
        this.gridId = gridId;
        this.props = props;
        this.alignment = props.alignment;
        this.canDrag = props.draggable;
        this.canHide = props.hidable !== "no";
        this.canResize = props.resizable;
        this.hidable = props.hidable;
        this.hidden = props.hidable === "hidden";
        this.supress = props.supress === "true";
        this.columnNumber = columnNumber;
        this.weight = props.size ?? 1;
        this.width = props.width;
        this.wrapText = props.wrapText;
    }

    columnClass(_item?: unknown): string | undefined {
        return undefined;
    }

    get canSort(): boolean {
        return this.props.sortable;
    }
    get columnId(): string {
        return `${this.gridId}-column${this.columnNumber}`;
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
