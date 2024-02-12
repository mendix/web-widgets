import { ObjectItem, ValueStatus, ListAttributeValue } from "mendix";
import { createElement, ReactElement, ReactNode } from "react";
import { ColumnsType } from "../../typings/DatagridProps";
import { GridColumn, ColumnId } from "../typings/GridColumn";
import { BaseColumn } from "./ColumnBase";
import { Actions, SortRule, State } from "../typings/GridModel";

export class Column extends BaseColumn implements GridColumn {
    private props: ColumnsType;
    private unstable_state: State | undefined;
    private unstable_actions: Actions | undefined;

    columnNumber: number;

    constructor(props: ColumnsType, columnNumber: number) {
        super(props);

        this.props = props;
        this.columnNumber = columnNumber;
    }

    columnClass(item: ObjectItem): string | undefined {
        return this.props.columnClass?.get(item).value;
    }

    get canSort(): boolean {
        return super.canSort && !!this.props.attribute?.sortable;
    }

    /**
     * For now it's just a column index. In the future it should be replaced by the platform provided tag/id.
     */
    get columnId(): ColumnId {
        return this.columnNumber.toString() as ColumnId;
    }

    get header(): string {
        return this.props.header?.value ?? "";
    }

    get isAvailable(): boolean {
        return this.props.visible?.value ?? false;
    }

    get status(): ValueStatus {
        return this.props.visible?.status ?? ValueStatus.Loading;
    }

    get attrId(): ListAttributeValue["id"] | undefined {
        return this.props.attribute?.id;
    }

    get isHidden(): boolean {
        const state = this.unstable_getState();

        return state.hidden.has(this.columnId);
    }

    toggleHidden(): void {
        this.unstable_getActions().toggleHidden(this.columnId);
    }

    get sortRule(): SortRule | undefined {
        return this.unstable_getState().sortOrder.find(([id]) => this.columnId === id);
    }

    toggleSort() {
        this.unstable_getActions().sortBy(this.columnId);
    }

    setInitParams(): void {
        // Defer options fetching
        if (this.props.filterAssociationOptions) {
            this.props.filterAssociationOptions.setLimit(0);
        }
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

    // unstable part, needed for migration to new state management
    unstable_setStateAndActions(state: State | undefined, actions: Actions | undefined) {
        this.unstable_state = state;
        this.unstable_actions = actions;
    }

    private unstable_getState(): State {
        if (!this.unstable_state) {
            throw new Error("State is not available");
        }

        return this.unstable_state;
    }

    private unstable_getActions(): Actions {
        if (!this.unstable_actions) {
            throw new Error("Actions is not available");
        }

        return this.unstable_actions;
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

function CustomContent(props: { children: ReactNode }): ReactElement {
    return (
        <div onClick={stopPropagation} onKeyUp={stopPropagation} onKeyDown={onKeyDown} className="td-custom-content">
            {props.children}
        </div>
    );
}
