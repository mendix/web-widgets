import { useMemo } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { GridLoader, State } from "./GridLoader";
import { getHash } from "./utils";
import { useSettingsClient } from "../storage/use-settings-client";

export function useModel({
    name,
    columns: sourceColumns,
    datasource,
    pageSize,
    pagination: paginationType,
    configurationAttribute
}: DatagridContainerProps): [initState: State, columns: Column[]] {
    const loader = useMemo(() => new GridLoader(), []);
    const columns = useMemo(() => sourceColumns.map((col, index) => new Column(col, index)), [sourceColumns]);
    const hash = useMemo(() => getHash(columns, name), [name, columns]);
    const settingsClient = useSettingsClient(hash, configurationAttribute);

    return [loader.getInitState(datasource, paginationType, pageSize, columns, settingsClient), columns];
}
