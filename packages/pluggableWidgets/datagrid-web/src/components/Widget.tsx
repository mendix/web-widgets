import { ReactElement } from "react";
import { Grid } from "./Grid";
import { GridBody } from "./GridBody";
import { RowsRenderer } from "./RowsRenderer";
import { WidgetContent } from "./WidgetContent";
import { WidgetFooter } from "./WidgetFooter";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";
import { GridHeader } from "../features/columns/GridHeader";
import { ExportProgressDialog } from "../features/data-export/ExportProgressDialog";
import { RefreshStatus } from "../features/datasource/RefreshStatus";
import { EmptyPlaceholder } from "../features/empty-message/EmptyPlaceholder";
import { SelectAllBar } from "../features/select-all/SelectAllBar";
import { SelectionProgressDialog } from "../features/select-all/SelectionProgressDialog";

export function Widget(props: { onExportCancel?: () => void }): ReactElement {
    return (
        <WidgetRoot>
            <WidgetTopBar />
            <WidgetHeader />
            <WidgetContent>
                <Grid>
                    <GridHeader />
                    <SelectAllBar />
                    <RefreshStatus />
                    <GridBody>
                        <RowsRenderer />
                        <EmptyPlaceholder />
                    </GridBody>
                </Grid>
            </WidgetContent>
            <WidgetFooter />
            <SelectionProgressDialog />
            <ExportProgressDialog onExportCancel={props.onExportCancel} />
        </WidgetRoot>
    );
}
