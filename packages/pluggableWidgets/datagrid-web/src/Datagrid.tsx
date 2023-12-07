import { createElement, useMemo } from "react";
import { ValueStatus } from "mendix";
import { DatagridContainerProps } from "../typings/DatagridProps";
import DatagridContainer from "./components/Datagrid";
import "./ui/Datagrid.scss";
import { useInitialize } from "./features/initialization/use-initialize";
import { Column } from "./helpers/Column";

export default function Datagrid(props: DatagridContainerProps): React.ReactElement {
    const columns = useMemo(() => props.columns.map((col, index) => new Column(col, index)), [props.columns]);
    const [initState] = useInitialize(props, columns);

    if (initState === undefined || props.datasource.status === ValueStatus.Loading) {
        return <span>Loading</span>;
    }

    return <DatagridContainer {...props} columns={columns} rawColumns={props.columns} initState={initState} />;
}
