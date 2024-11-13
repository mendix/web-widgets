import {
    DynamicValue,
    ListAttributeValue,
    ListAttributeListValue,
    ListExpressionValue,
    ListWidgetValue,
    ObjectItem,
    ValueStatus
} from "mendix";
import { createElement, ReactElement, ReactNode } from "react";
import { AlignmentEnum, ColumnsType } from "../../../../typings/DatagridProps";
import { ColumnId, GridColumn } from "../../../typings/GridColumn";
import { Big } from "big.js";
import { action, computed, makeObservable, observable } from "mobx";
import { BaseColumnInfo } from "./BaseColumnInfo";
import { IColumnParentStore } from "../ColumnGroupStore";
import { SortDirection } from "../../../typings/sorting";
import { ColumnPersonalizationSettings } from "../../../typings/personalization-settings";

export class ColumnStore implements GridColumn {
    columnIndex: number;
    isHidden: boolean;
    size: number | undefined = undefined;
    orderWeight: number;

    private headerElementRef: HTMLDivElement | null = null;

    private baseInfo: BaseColumnInfo;
    private parentStore: IColumnParentStore;

    private frozenSize: number | undefined;

    // dynamic props from PW API
    private _visible?: DynamicValue<boolean> = undefined; // can't render when unavailable
    private _header?: DynamicValue<string> = undefined; // can render when unavailable
    private _columnClass?: ListExpressionValue<string> = undefined; // can render when unavailable
    private _tooltip?: ListExpressionValue<string> = undefined; // part of attribute or dynamicText
    private _attribute?:
        | ListAttributeValue<string | Big | boolean | Date>
        | ListAttributeListValue<string | Big | boolean | Date> = undefined; // as "attribute"
    private _dynamicText?: ListExpressionValue<string> = undefined; // as "dynamicText"
    private _content?: ListWidgetValue = undefined; // as "customContent"

    constructor(index: number, props: ColumnsType, parentStore: IColumnParentStore) {
        this.parentStore = parentStore;

        this.baseInfo = new BaseColumnInfo(props); // base props never change, it is safe to no update them

        this.columnIndex = index; // this number also never changes
        this.isHidden = this.baseInfo.initiallyHidden;
        this.orderWeight = index * 10;

        makeObservable<
            ColumnStore,
            "_visible" | "_header" | "_columnClass" | "_tooltip" | "_attribute" | "_dynamicText" | "_content"
        >(this, {
            _visible: observable.ref,
            _header: observable.ref,
            _columnClass: observable.ref,
            _tooltip: observable.ref,
            _attribute: observable.ref,
            _dynamicText: observable.ref,
            _content: observable.ref,

            isHidden: observable,
            size: observable,
            orderWeight: observable,

            updateProps: action,
            toggleHidden: action,
            setSize: action,
            applySettings: action,

            canSort: computed,
            header: computed,
            loaded: computed,
            settings: computed.struct
        });

        this.updateProps(props);
    }

    updateProps(props: ColumnsType): void {
        this._visible = props.visible;

        this._header = props.header;

        this._columnClass = props.columnClass;
        this._tooltip = props.tooltip;

        this._attribute = props.attribute;
        this._content = props.content;
        this._dynamicText = props.dynamicText;
    }

    // old props
    get alignment(): AlignmentEnum {
        return this.baseInfo.alignment;
    }

    get initiallyHidden(): boolean {
        return this.baseInfo.initiallyHidden;
    }

    get wrapText(): boolean {
        return this.baseInfo.wrapText;
    }

    get canDrag(): boolean {
        return this.baseInfo.draggable;
    }

    // hiding
    get canHide(): boolean {
        return this.baseInfo.hidable;
    }

    toggleHidden(): void {
        this.isHidden = !this.isHidden;
    }

    // size
    get canResize(): boolean {
        // column is not resizable if it is at the end of the grid
        return this.baseInfo.resizable && !this.parentStore.isLastVisible(this);
    }

    setSize(size: number | undefined): void {
        this.size = size;
    }

    // sorting
    get canSort(): boolean {
        return this.baseInfo.sortable && !!this._attribute?.sortable;
    }

    get sortDir(): SortDirection | undefined {
        return this.parentStore.sorting.getDirection(this.columnId)?.[0];
    }

    get sortWeight(): number | undefined {
        return this.parentStore.sorting.getDirection(this.columnId)?.[1];
    }

    toggleSort(): void {
        this.parentStore.sorting.toggleSort(this.columnId);
    }

    get columnId(): ColumnId {
        return this.columnIndex.toString() as ColumnId;
    }

    get header(): string {
        return this._header?.value ?? "";
    }

    get isAvailable(): boolean {
        if (!this._visible) {
            // there is no expression at all, treating as loaded and available
            return true;
        }
        return this._visible.value ?? false;
    }

    get loaded(): boolean {
        if (!this._visible) {
            // there is no value at all, treating as loaded and available
            return true;
        }

        if (this._visible.status === ValueStatus.Loading && this._visible.value === undefined) {
            // if status is Loading and no previous value is available it means initial loading
            return false;
        }

        return true;
    }

    get attrId(): ListAttributeValue["id"] | undefined {
        return this._attribute?.id;
    }

    setHeaderElementRef(ref: HTMLDivElement | null): void {
        this.headerElementRef = ref;
    }

    takeSizeSnapshot(): void {
        const size = this.headerElementRef?.clientWidth;
        this.frozenSize = this.size;
        if (size) {
            this.setSize(size);
        }
    }

    renderCellContent(item: ObjectItem): ReactElement {
        switch (this.baseInfo.showContentAs) {
            case "attribute":
            case "dynamicText": {
                return (
                    <span className="td-text" title={this._tooltip?.get(item)?.value}>
                        {this.baseInfo.showContentAs === "attribute"
                            ? this._attribute?.get(item)?.displayValue
                            : this._dynamicText?.get(item)?.value}
                    </span>
                );
            }
            case "customContent": {
                return (
                    <CustomContent allowEventPropagation={this.baseInfo.allowEventPropagation}>
                        {this._content?.get(item)}
                    </CustomContent>
                );
            }
            default:
                throw new Error(`Unknown content type: ${this.baseInfo.showContentAs}`);
        }
    }

    columnClass(item: ObjectItem): string | undefined {
        return this._columnClass?.get(item).value;
    }

    getCssWidth(): string {
        if (this.size) {
            if (this.parentStore.isLastVisible(this)) {
                return "minmax(min-content, auto)";
            }
            return `${this.size}px`;
        }
        return this.baseInfo.columnWidth;
    }

    get settings(): ColumnPersonalizationSettings {
        return {
            columnId: this.columnId,
            size: this.parentStore.isResizing ? this.frozenSize : this.size,
            hidden: this.isHidden,
            orderWeight: this.orderWeight,
            sortDir: this.sortDir,
            sortWeight: this.sortWeight
        };
    }

    applySettings(conf: ColumnPersonalizationSettings): void {
        this.size = conf.size;
        if (this.canHide) {
            this.isHidden = conf.hidden;
        }
        this.orderWeight = conf.orderWeight * 10;
    }
}

const stopPropagation = (event: { stopPropagation(): void }): void => {
    event.stopPropagation();
};

const onKeyDown = (event: React.KeyboardEvent): void => {
    if (event.code === "Tab") {
        return;
    }

    event.stopPropagation();
};

function CustomContent({
    children,
    allowEventPropagation
}: {
    children: ReactNode;
    allowEventPropagation: boolean;
}): ReactElement {
    const wrapperProps: JSX.IntrinsicElements["div"] = allowEventPropagation
        ? {}
        : {
              onClick: stopPropagation,
              onKeyUp: stopPropagation,
              onKeyDown
          };

    return (
        <div className="td-custom-content" {...wrapperProps}>
            {children}
        </div>
    );
}
