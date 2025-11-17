import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";
import { useDatagridConfig, useGridStyle } from "../model/hooks/injection-hooks";

export const Grid = observer(function Grid(props: PropsWithChildren): ReactElement {
    const config = useDatagridConfig();
    const style = useGridStyle().get();
    return (
        <div
            aria-multiselectable={config.multiselectable}
            className={"widget-datagrid-grid table"}
            role="grid"
            style={style}
        >
            {props.children}
        </div>
    );
});
