import {
    AlignmentEnum,
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

    allowEventPropagation: boolean;
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
    allowEventPropagation: boolean;

    constructor(props: BaseColumnInfoProps) {
        this.alignment = props.alignment;
        this.sortable = props.sortable;
        this.resizable = props.resizable;
        this.draggable = props.draggable;
        this.hidable = props.hidable !== "no";
        this.initiallyHidden = props.hidable === "hidden";
        this.wrapText = props.wrapText;
        this.showContentAs = props.showContentAs;
        this.weight = props.size ?? 1;
        this.width = props.width;
        this.minWidth = props.minWidth;
        this.minWidthLimit = props.minWidthLimit;
        this.allowEventPropagation = props.allowEventPropagation;
    }

    get minColumnWidth(): "auto" | "min-content" | `${number}px` {
        switch (this.minWidth) {
            case "auto": {
                return "auto";
            }
            case "minContent": {
                return "min-content";
            }
            case "manual": {
                return `${this.minWidthLimit}px`;
            }
        }
    }

    get columnWidth(): string {
        switch (this.width) {
            case "autoFill": {
                return `minmax(${this.minColumnWidth}, 1fr)`;
            }
            case "autoFit": {
                return `minmax(${this.minColumnWidth}, auto)`;
            }
            case "manual":
                return `minmax(${this.minColumnWidth}, ${this.weight}fr)`;
        }
    }
}
