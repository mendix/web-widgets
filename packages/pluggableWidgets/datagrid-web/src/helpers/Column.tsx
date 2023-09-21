import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";
import { ObjectItem } from "mendix";
import { createElement, ReactElement } from "react";
import { AlignmentEnum, ColumnsType, HidableEnum, WidthEnum } from "../../typings/DatagridProps";
import { GridColumn } from "../typings/GridColumn";

export class Column implements GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;
    canHide: boolean;
    canResize: boolean;
    columnNumber: number;
    hidable: HidableEnum;
    hidden: boolean;
    weight: number;
    width: WidthEnum;
    wrapText: boolean;
    private gridId: string;
    private props: ColumnsType;

    constructor(props: ColumnsType, columnNumber: number, gridId: string) {
        this.alignment = props.alignment;
        this.canDrag = props.draggable;
        this.canHide = props.hidable !== "no";
        this.canResize = props.resizable;
        this.columnNumber = columnNumber;
        this.gridId = gridId;
        this.hidable = props.hidable;
        this.hidden = props.hidable === "hidden";
        this.props = props;
        this.weight = props.size ?? 1;
        this.width = props.width;
        this.wrapText = props.wrapText;
    }

    columnClass(item: ObjectItem): string | undefined {
        return this.props.columnClass?.get(item).value;
    }

    get canSort(): boolean {
        return this.props.sortable && !!this.props.attribute?.sortable;
    }
    get columnId(): string {
        return `${this.gridId}-column${this.columnNumber}`;
    }
    get header(): string {
        let value: string | undefined;
        if (this.props.header && isAvailable(this.props.header)) {
            value = this.props.header.value;
        }

        return value ?? "";
    }
    renderCellContent(item: ObjectItem): ReactElement {
        switch (this.props.showContentAs) {
            case "attribute": {
                return (
                    <span className="td-text" title={this.props.tooltip?.get(item)?.value}>
                        {this.props.attribute?.get(item)?.displayValue ?? ""}
                    </span>
                );
            }
            case "dynamicText": {
                return (
                    <span className="td-text" title={this.props.tooltip?.get(item)?.value}>
                        {this.props.dynamicText?.get(item)?.value ?? ""}
                    </span>
                );
            }
            case "customContent": {
                return <div className="td-custom-content">{this.props.content?.get(item)}</div>;
            }
            default:
                throw new Error(`Unknown content type: ${this.props.showContentAs}`);
        }
    }
}
