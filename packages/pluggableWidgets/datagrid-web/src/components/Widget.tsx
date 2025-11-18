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
import { EventsController } from "../typings/CellComponent";
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

export interface WidgetProps {
    className: string;
    columnsDraggable: boolean;
    columnsFilterable: boolean;
    columnsHidable: boolean;
    columnsResizable: boolean;
    columnsSortable: boolean;
    data: ObjectItem[];
    exporting: boolean;
    headerContent?: ReactNode;
    headerTitle?: string;
    id: string;
    numberOfItems?: number;
    onExportCancel?: () => void;
    paginationType: PaginationEnum;
    loadMoreButtonCaption?: string;

    processedRows: number;

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
}

export const Widget = observer(function Widget(props: WidgetProps) {
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

const Main = observer((props: WidgetProps): ReactElement => {
    const { data: rows, headerContent, headerTitle, loadMoreButtonCaption, showRefreshIndicator } = props;

    return (
        <Fragment>
            <WidgetTopBar />
            <WidgetHeader headerTitle={headerTitle} headerContent={headerContent} />
            <WidgetContent>
                <Grid>
                    <GridHeader />
                    <SelectAllBar />
                    {showRefreshIndicator ? <RefreshIndicator /> : null}
                    <GridBody>
                        <RowsRenderer rows={rows} />
                        <EmptyPlaceholder />
                    </GridBody>
                </Grid>
            </WidgetContent>
            <WidgetFooter loadMoreButtonCaption={loadMoreButtonCaption} />
        </Fragment>
    );
});
