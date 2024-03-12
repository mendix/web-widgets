import {
    AlignmentEnum,
    DatagridContainerProps,
    HidableEnum,
    MinWidthEnum,
    ShowContentAsEnum,
    WidthEnum
} from "../../../../typings/DatagridProps";

interface BaseColumnInfoProps {
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: HidableEnum;
    width: WidthEnum;
    size: number | null;
    alignment: AlignmentEnum;

    showContentAs: ShowContentAsEnum;

    wrapText: boolean;

    minWidth: MinWidthEnum;
    minWidthLimit: number;
}

export class BaseColumnInfo {
    alignment: AlignmentEnum;
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: boolean;
    initiallyHidden: boolean;
    wrapText: boolean;
    showContentAs: ShowContentAsEnum;
    weight: number;
    width: WidthEnum;
    minWidth: MinWidthEnum;
    minWidthLimit: number;

    constructor(props: BaseColumnInfoProps, widgetProps: DatagridContainerProps) {
        this.alignment = props.alignment;
        this.sortable = widgetProps.columnsSortable && props.sortable;
        this.resizable = widgetProps.columnsResizable && props.resizable;
        this.draggable = widgetProps.columnsDraggable && props.draggable;
        this.hidable = widgetProps.columnsHidable && props.hidable !== "no";
        this.initiallyHidden = props.hidable === "hidden";
        this.wrapText = props.wrapText;
        this.showContentAs = props.showContentAs;
        this.weight = props.size ?? 1;
        this.width = props.width;
        this.minWidth = props.minWidth;
        this.minWidthLimit = props.minWidthLimit;
    }

    get columnWidth(): string {
        switch (this.width) {
            case "autoFit": {
                const min =
                    this.minWidth === "manual"
                        ? `${this.minWidthLimit}px`
                        : this.minWidth === "minContent"
                        ? "min-content"
                        : "auto";
                return `minmax(${min}, auto)`;
            }
            case "manual":
                return `${this.weight}fr`;
            default:
                return "1fr";
        }
    }
}
