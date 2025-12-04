import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";
import { useDatagridConfig, useGridSizeStore, useGridStyle } from "../model/hooks/injection-hooks";

export const Grid = observer(function Grid(props: PropsWithChildren): ReactElement {
    const config = useDatagridConfig();
    const gridSizeStore = useGridSizeStore();

    const style = useGridStyle().get();
    return (
        <div
            aria-multiselectable={config.multiselectable}
            className={classNames("widget-datagrid-grid table", {
                "infinite-loading": gridSizeStore.hasVirtualScrolling
            })}
            role="grid"
            style={style}
            ref={gridSizeStore.gridContainerRef}
        >
            {props.children}
        </div>
    );
});
