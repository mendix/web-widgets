import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";
import { useGridStyle } from "./features/columns/tokens";
import { useDatagridConfig } from "./features/core/tokens";
import { useGridSizeStore } from "./features/pagination/tokens";
import { useInfiniteControl } from "./features/pagination/useInfiniteControl";

export const Grid = observer(function Grid(props: PropsWithChildren): ReactElement {
    const config = useDatagridConfig();
    const gridSizeStore = useGridSizeStore();
    const [handleScroll] = useInfiniteControl();

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
            onScroll={handleScroll}
        >
            {props.children}
        </div>
    );
});
