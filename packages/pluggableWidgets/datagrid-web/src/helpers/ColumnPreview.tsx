import { createElement, ReactElement } from "react";
import { ColumnsPreviewType } from "../../typings/DatagridProps";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { BaseColumn } from "./ColumnBase";
import { SortDirection } from "../typings/sorting";

export class ColumnPreview extends BaseColumn implements GridColumn {
    private props: ColumnsPreviewType;

    columnIndex: number;

    constructor(props: ColumnsPreviewType, columnNumber: number) {
        super({
            ...props,
            minWidthLimit: props.minWidthLimit ?? 100
        });

        this.props = props;
        this.columnIndex = columnNumber;
    }

    columnClass(_item?: unknown): string | undefined {
        return undefined;
    }
    get columnId(): ColumnId {
        return this.columnIndex.toString() as ColumnId;
    }
    get header(): string {
        return (this.props.header?.trim().length ?? 0) === 0 ? "[Empty caption]" : this.props.header;
    }
    get isAvailable(): boolean {
        return this.props.visible !== "false";
    }
    get isHidden(): boolean {
        return this.initiallyHidden;
    }
    toggleHidden(): void {}
    get sortDir(): SortDirection | undefined {
        return undefined;
    }
    toggleSort(): void {}

    get size(): number | undefined {
        return undefined;
    }

    setSize(_size: number): void {
        return undefined;
    }

    setHeaderElementRef(_ref?: HTMLDivElement | null): void {
        return undefined;
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
