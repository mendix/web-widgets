import { useMemo } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { GridLoader, State } from "./GridLoader";

export function useModel({
    columns,
    datasource,
    pageSize,
    pagination: paginationType,
    configurationAttribute
}: DatagridContainerProps): [initState: State, mappedColumns: Column[]] {
    const loader = useMemo(() => new GridLoader(), []);
    const mappedColumns = useMemo(() => columns.map((col, index) => new Column(col, index)), [columns]);

    return [
        loader.getInitState(datasource, paginationType, pageSize, mappedColumns, configurationAttribute),
        mappedColumns
    ];
}
