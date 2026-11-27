import { ReactElement } from "react";
import { ExportProgressDialog } from "./features/data-export/ExportProgressDialog";
import { RefreshStatus } from "./features/datasource/RefreshStatus";
import { EmptyPlaceholder } from "./features/empty-message/EmptyPlaceholder";
import { SelectAllBar } from "./features/selection/select-all/SelectAllBar";
import { SelectionProgressDialog } from "./features/selection/select-all/SelectionProgressDialog";
import { Grid } from "./Grid";
import { GridBody } from "./GridBody";
import { GridHeader } from "./GridHeader";
import { RowsRenderer } from "./RowsRenderer";
import { TopHorizontalScrollbar } from "./TopHorizontalScrollbar";
import { WidgetContent } from "./ui/WidgetContent";
import { WidgetFooter } from "./WidgetFooter";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";

export function Widget(props: { onExportCancel?: () => void; showTopScrollbar: boolean }): ReactElement {
    return (
        <WidgetRoot>
            <WidgetTopBar />
            <WidgetHeader />

            {props.showTopScrollbar ? <TopHorizontalScrollbar /> : null}

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
