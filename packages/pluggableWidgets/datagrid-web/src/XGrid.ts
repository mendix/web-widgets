import { ObjectItem } from "mendix";
import { makeObservable, observable, computed, action } from "mobx";
import { ColumnsType, DatagridContainerProps } from "../typings/DatagridProps";
import { ColumnId } from "./typings/GridColumn";

export class XColumn {
    id: ColumnId;
    contentType: ColumnsType["showContentAs"];
    attribute: ColumnsType["attribute"];
    dynamicText: ColumnsType["dynamicText"];
    header: ColumnsType["header"] = undefined;
    constructor(props: ColumnsType) {
        this.id = Math.random().toString().slice(2, 10) as ColumnId;
        this.contentType = props.showContentAs;
        this.attribute = props.attribute;
        this.dynamicText = props.dynamicText;
        makeObservable(this, {
            attribute: observable.ref,
            dynamicText: observable.ref,
            header: observable.ref,
            caption: computed,
            updateColumn: action
        });
    }

    get caption(): string {
        return this.header?.value ?? "Loading";
    }

    updateColumn(props: ColumnsType): void {
        this.header = props.header;
        if (props.attribute && this.attribute !== props.attribute) {
            this.attribute = { ...props.attribute };
        }
        if (props.dynamicText && props.dynamicText !== this.dynamicText) {
            this.dynamicText = { ...props.dynamicText };
        }
    }
}

export class XCell {
    id: string;
    constructor(private grid: XGrid, public column: XColumn, private row: XRow, public item: ObjectItem) {
        this.id = `${this.row.id}/${this.column.id}`;
        makeObservable(this, {
            content: computed,
            style: computed,
            isSelected: computed
        });
    }

    get content(): React.ReactNode {
        return this.column.contentType === "attribute"
            ? this.column.attribute?.get(this.item)?.displayValue
            : this.column.dynamicText?.get(this.item)?.value;
    }

    onClick = (): void => {
        // console.log("Grid", typeof this.grid);
        this.grid.selectItem(this.item);
    };

    get style(): React.CSSProperties {
        console.log("compute style");
        return this.isSelected ? { background: "#0e0" } : {};
    }

    get isSelected(): boolean {
        return this.grid.selection?.selection === this.item;
    }
}

export class XRow {
    cells: XCell[] = [];
    constructor(private item: ObjectItem) {}

    get id(): ObjectItem["id"] {
        return this.item.id;
    }
}

export class XGrid {
    private items: ObjectItem[];
    selection: DatagridContainerProps["itemSelection"] = undefined;
    constructor(public columns: XColumn[]) {
        this.items = [];
        makeObservable<XGrid, "rows" | "items">(this, {
            rows: computed,
            items: observable.shallow,
            setItems: action,
            setSelection: action,
            selection: observable.ref
        });
    }

    get rows(): XRow[] {
        return this.items.map(item => {
            const row = new XRow(item);
            row.cells = this.columns.map(col => new XCell(this, col, row, item));
            return row;
        });
    }

    setItems(items: ObjectItem[]): void {
        this.items = items;
    }

    setSelection(selection: DatagridContainerProps["itemSelection"]): void {
        this.selection = selection;
    }

    selectItem(item: ObjectItem): void {
        if (this.selection?.type === "Single") {
            this.selection?.setSelection(item);
        }
    }
}
