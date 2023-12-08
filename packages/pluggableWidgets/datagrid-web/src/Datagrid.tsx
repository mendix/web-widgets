import { createElement, useMemo } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import DatagridContainer from "./components/Datagrid";
import "./ui/Datagrid.scss";
import { useInitialize } from "./features/state/use-initialize";
import { Column } from "./helpers/Column";

export default function Datagrid(props: DatagridContainerProps): React.ReactElement {
    const columns = useMemo(() => props.columns.map((col, index) => new Column(col, index)), [props.columns]);
    const [initState] = useInitialize(props, columns);

    if (initState === undefined) {
        return <span>Loading</span>;
    }

    return <DatagridContainer {...props} columns={columns} rawColumns={props.columns} initState={initState} />;
}
