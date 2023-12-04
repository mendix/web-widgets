import { AlignmentEnum, HidableEnum, WidthEnum } from "../../typings/DatagridProps";

interface BaseColumnProps {
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: HidableEnum;
    width: WidthEnum;
    size: number | null;
    alignment: AlignmentEnum;

    wrapText: boolean;
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

    get weight(): number {
        return this.properties.size ?? 1;
    }

    get width(): WidthEnum {
        return this.properties.width;
    }

    get wrapText(): boolean {
        return this.properties.wrapText;
    }
}
