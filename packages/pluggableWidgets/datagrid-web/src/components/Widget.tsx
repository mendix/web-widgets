import { RefreshIndicator } from "@mendix/widget-plugin-component-kit/RefreshIndicator";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { ListActionValue, ObjectItem } from "mendix";
import { observer } from "mobx-react-lite";
import { CSSProperties, Fragment, ReactElement, ReactNode } from "react";
import { LoadingTypeEnum, PaginationEnum } from "../../typings/DatagridProps";

import { EmptyPlaceholder } from "../features/empty-message/EmptyPlaceholder";
import { SelectAllBar } from "../features/select-all/SelectAllBar";
import { SelectionProgressDialog } from "../features/select-all/SelectionProgressDialog";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { useBasicData } from "../model/hooks/injection-hooks";
import { CellComponent, EventsController } from "../typings/CellComponent";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { ExportWidget } from "./ExportWidget";
import { Grid } from "./Grid";
import { GridBody } from "./GridBody";
import { GridHeader } from "./GridHeader";
import { RowsRenderer } from "./RowsRenderer";
import { WidgetContent } from "./WidgetContent";
import { WidgetFooter } from "./WidgetFooter";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";

export interface WidgetProps<C extends GridColumn, T extends ObjectItem = ObjectItem> {
    CellComponent: CellComponent<C>;
    className: string;
    columnsDraggable: boolean;
    columnsFilterable: boolean;
    columnsHidable: boolean;
    columnsResizable: boolean;
    columnsSortable: boolean;
    data: T[];
    exporting: boolean;
    filterRenderer: (renderWrapper: (children: ReactNode) => ReactElement, columnIndex: number) => ReactElement;
    headerContent?: ReactNode;
    headerTitle?: string;
    headerWrapperRenderer: (columnIndex: number, header: ReactElement) => ReactElement;
    id: string;
    numberOfItems?: number;
    onExportCancel?: () => void;
    paginationType: PaginationEnum;
    loadMoreButtonCaption?: string;

    processedRows: number;
    rowClass?: (item: T) => string;
    styles?: CSSProperties;
    rowAction?: ListActionValue;
    isFirstLoad: boolean;
    isFetchingNextBatch: boolean;
    loadingType: LoadingTypeEnum;
    columnsLoading: boolean;
    showRefreshIndicator: boolean;

    // Helpers
    cellEventsController: EventsController;
    checkboxEventsController: EventsController;
    selectActionHelper: SelectActionHelper;
    focusController: FocusTargetController;

    visibleColumns: GridColumn[];
    availableColumns: GridColumn[];

    columnsSwap: (source: ColumnId, target: [ColumnId, "after" | "before"]) => void;
    setIsResizing: (status: boolean) => void;
}

export const Widget = observer(<C extends GridColumn>(props: WidgetProps<C>): ReactElement => {
    const { className, exporting, numberOfItems, onExportCancel, selectActionHelper } = props;
    const basicData = useBasicData();
    const selectionEnabled = selectActionHelper.selectionType !== "None";

    return (
        <WidgetRoot
            className={className}
            selectionMethod={selectActionHelper.selectionMethod}
            selection={selectionEnabled}
            style={props.styles}
            exporting={exporting}
        >
            <Main {...props} data={exporting ? [] : props.data} />
            <SelectionProgressDialog />
            {exporting && (
                <ExportWidget
                    alertLabel={basicData.exportDialogLabel ?? "Export progress"}
                    cancelLabel={basicData.cancelExportLabel ?? "Cancel data export"}
                    failed={false}
                    onCancel={onExportCancel}
                    open={exporting}
                    progress={props.processedRows}
                    total={numberOfItems}
                />
            )}
        </WidgetRoot>
    );
});

const Main = observer(<C extends GridColumn>(props: WidgetProps<C>): ReactElement => {
    const {
        CellComponent,
        columnsHidable,
        data: rows,
        headerContent,
        headerTitle,
        loadMoreButtonCaption,
        showRefreshIndicator,
        selectActionHelper,
        visibleColumns
    } = props;

    const basicData = useBasicData();

    return (
        <Fragment>
            <WidgetTopBar />
            <WidgetHeader headerTitle={headerTitle} headerContent={headerContent} />
            <WidgetContent>
                <Grid>
                    <GridHeader
                        availableColumns={props.availableColumns}
                        columns={visibleColumns}
                        setIsResizing={props.setIsResizing}
                        columnsDraggable={props.columnsDraggable}
                        columnsFilterable={props.columnsFilterable}
                        columnsHidable={props.columnsHidable}
                        columnsResizable={props.columnsResizable}
                        columnsSortable={props.columnsSortable}
                        columnsSwap={props.columnsSwap}
                        filterRenderer={props.filterRenderer}
                        headerWrapperRenderer={props.headerWrapperRenderer}
                        id={props.id}
                        isLoading={props.columnsLoading}
                        preview={false}
                    />
                    <SelectAllBar />
                    {showRefreshIndicator ? <RefreshIndicator /> : null}
                    <GridBody>
                        <RowsRenderer
                            preview={false}
                            interactive={basicData.gridInteractive}
                            Cell={CellComponent}
                            columns={visibleColumns}
                            columnsHidable={columnsHidable}
                            rows={rows}
                            rowClass={props.rowClass}
                            selectableWrapper={props.headerWrapperRenderer}
                            selectActionHelper={selectActionHelper}
                            focusController={props.focusController}
                            eventsController={props.cellEventsController}
                        />
                        <EmptyPlaceholder />
                    </GridBody>
                </Grid>
            </WidgetContent>
            <WidgetFooter loadMoreButtonCaption={loadMoreButtonCaption} />
        </Fragment>
    );
});
