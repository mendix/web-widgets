import { AlignmentEnum, HidableEnum, MinWidthEnum, WidthEnum } from "../../typings/DatagridProps";

interface BaseColumnProps {
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: HidableEnum;
    width: WidthEnum;
    size: number | null;
    alignment: AlignmentEnum;

    wrapText: boolean;
    minWidth: MinWidthEnum;
    minWidthLimit: number;
}

export class BaseColumn {
    constructor(private properties: BaseColumnProps) {}

    get alignment(): AlignmentEnum {
        return this.properties.alignment;
    }

    get canSort(): boolean {
        return this.properties.sortable;
    }

    get canResize(): boolean {
        return this.properties.resizable;
    }

    get canDrag(): boolean {
        return this.properties.draggable;
    }

    get canHide(): boolean {
        return this.properties.hidable !== "no";
    }

    get initiallyHidden(): boolean {
        return this.properties.hidable === "hidden";
    }

    get wrapText(): boolean {
        return this.properties.wrapText;
    }

    getCssWidth(): string {
        switch (this.properties.width) {
            case "autoFit": {
                const min =
                    this.properties.minWidth === "manual"
                        ? `${this.properties.minWidthLimit}px`
                        : this.properties.minWidth === "minContent"
                        ? "min-content"
                        : "auto";
                return `minmax(${min}, auto)`;
            }
            case "manual":
                return `${this.properties.size ?? 1}fr`;
            default:
                return "1fr";
        }
    }
}
