import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";
import { ObjectItem } from "mendix";
import { createElement, ReactElement } from "react";
import { AlignmentEnum, ColumnsType, HidableEnum, WidthEnum } from "../../../typings/DatagridProps";
import { GridColumn } from "./GridColumn";

export class Column implements GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;
    canHide: boolean;
    canResize: boolean;
    hidable: HidableEnum;
    hidden: boolean;
    sourceIndex: number;
    weight: number;
    width: WidthEnum;
    private gridId: string;
    private props: ColumnsType;
    constructor(props: ColumnsType, sourceIndex: number, gridId: string) {
        this.gridId = gridId;
        this.props = props;
        this.alignment = props.alignment;
        this.canDrag = props.draggable;
        this.canHide = props.hidable !== "no";
        this.canResize = props.resizable;
        this.hidable = props.hidable;
        this.hidden = props.hidable === "hidden";
        this.sourceIndex = sourceIndex;
        this.weight = props.size ?? 1;
        this.width = props.width;
    }

    get canSort(): boolean {
        return this.props.sortable && !!this.props.attribute?.sortable;
    }
    get columnId(): string {
        return `${this.gridId}-column${this.sourceIndex}`;
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
