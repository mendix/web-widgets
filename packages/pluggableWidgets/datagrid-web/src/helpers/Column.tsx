import { ObjectItem } from "mendix";
import { createElement, ReactElement, ReactNode } from "react";
import { AlignmentEnum, ColumnsType, WidthEnum } from "../../typings/DatagridProps";
import { GridColumn } from "../typings/GridColumn";

export class Column implements GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;
    canHide: boolean;
    canResize: boolean;
    columnNumber: number;
    hidden: boolean;
    visible: boolean;
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
        this.hidden = props.hidable === "hidden";
        this.visible = props.visible?.value ?? false;
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
        return this.props.header?.value ?? "";
    }
    renderCellContent(item: ObjectItem): ReactElement {
        switch (this.props.showContentAs) {
            case "attribute":
            case "dynamicText": {
                return (
                    <span className="td-text" title={this.props.tooltip?.get(item)?.value}>
                        {this.props.showContentAs === "attribute"
                            ? this.props.attribute?.get(item)?.displayValue
                            : this.props.dynamicText?.get(item)?.value}
                    </span>
                );
            }
            case "customContent": {
                return <CustomContent>{this.props.content?.get(item)}</CustomContent>;
            }
            default:
                throw new Error(`Unknown content type: ${this.props.showContentAs}`);
        }
    }
}

const stopPropagation = (event: { stopPropagation(): void }): void => {
    event.stopPropagation();
};

function CustomContent(props: { children: ReactNode }): ReactElement {
    return (
        <div
            onClick={stopPropagation}
            onKeyUp={stopPropagation}
            onKeyDown={stopPropagation}
            className="td-custom-content"
        >
            {props.children}
        </div>
    );
}
