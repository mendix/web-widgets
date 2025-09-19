import { useMemo } from "react";
import {
    SelectActionHandler,
    SelectionHelper,
    SelectionMode,
    WidgetSelectionProperty
} from "@mendix/widget-plugin-grid/selection";
import { ListValue } from "mendix";
import { DatagridContainerProps, DatagridPreviewProps, ItemSelectionMethodEnum } from "../../typings/DatagridProps";
export type SelectionMethod = "rowClick" | "checkbox" | "none";

export class SelectActionHelper extends SelectActionHandler {
    pageSize: number;
    private _selectionMethod: ItemSelectionMethodEnum;
    private _showSelectAllToggle: boolean;
    private _datasource: ListValue;
    private _selectAllPagesEnabled: boolean;
    private _selectAllPagesBufferSize: number;

    constructor(
        selection: WidgetSelectionProperty,
        selectionHelper: SelectionHelper | undefined,
        _selectionMethod: ItemSelectionMethodEnum,
        _showSelectAllToggle: boolean,
        pageSize: number,
        private _selectionMode: SelectionMode,
        datasource: ListValue,
        selectAllPagesEnabled?: boolean,
        selectAllPagesBufferSize?: number
    ) {
        super(selection, selectionHelper);
        this._selectionMethod = _selectionMethod;
        this._showSelectAllToggle = _showSelectAllToggle;
        this.pageSize = pageSize;
        this._datasource = datasource;
        this._selectAllPagesEnabled = selectAllPagesEnabled ?? false;
        this._selectAllPagesBufferSize = selectAllPagesBufferSize ?? 500;
    }

    get selectionMethod(): SelectionMethod {
        return this.selectionType === "None" ? "none" : this._selectionMethod;
    }

    get showCheckboxColumn(): boolean {
        return this.selectionMethod === "checkbox";
    }

    get showSelectAllToggle(): boolean {
        return this._showSelectAllToggle && this.selectionType === "Multi";
    }

    get selectionMode(): SelectionMode {
        return this.selectionMethod === "checkbox" ? "toggle" : this._selectionMode;
    }

    get canSelectAllPages(): boolean {
        return this._selectAllPagesEnabled && this.selectionType === "Multi";
    }

    get totalCount(): number | undefined {
        return this._datasource?.totalCount;
    }

    get selectAllPagesBufferSize(): number {
        return this._selectAllPagesBufferSize;
    }
}

export function useSelectActionHelper(
    props: Pick<
        DatagridContainerProps | DatagridPreviewProps,
        | "itemSelection"
        | "itemSelectionMethod"
        | "showSelectAllToggle"
        | "pageSize"
        | "itemSelectionMode"
        | "datasource"
        | "selectAllPagesEnabled"
        | "selectAllPagesBufferSize"
    >,
    selectionHelper?: SelectionHelper
): SelectActionHelper {
    return useMemo(() => {
        return new SelectActionHelper(
            props.itemSelection,
            selectionHelper,
            props.itemSelectionMethod,
            props.showSelectAllToggle,
            props.pageSize ?? 5,
            props.itemSelectionMode,
            props.datasource as ListValue,
            props.selectAllPagesEnabled,
            props.selectAllPagesBufferSize ?? 500
        );
    }, [
        props.itemSelection,
        selectionHelper,
        props.itemSelectionMethod,
        props.showSelectAllToggle,
        props.pageSize,
        props.itemSelectionMode,
        props.datasource,
        props.selectAllPagesEnabled,
        props.selectAllPagesBufferSize
    ]);
}
