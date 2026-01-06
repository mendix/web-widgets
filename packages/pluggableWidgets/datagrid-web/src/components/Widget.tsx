import { ReactElement } from "react";
import { ExportProgressDialog } from "../features/data-export/ExportProgressDialog";
import { EmptyPlaceholder } from "../features/empty-message/EmptyPlaceholder";
import { SelectAllBar } from "../features/select-all/SelectAllBar";
import { SelectionProgressDialog } from "../features/select-all/SelectionProgressDialog";
import { Grid } from "./Grid";
import { GridBody } from "./GridBody";
import { GridHeader } from "./GridHeader";
import { RefreshStatus } from "./RefreshStatus";
import { RowsRenderer } from "./RowsRenderer";
import { WidgetContent } from "./WidgetContent";
import { WidgetFooter } from "./WidgetFooter";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";
import { MockHeader } from "./MockHeader";

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
                        <MockHeader />
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
