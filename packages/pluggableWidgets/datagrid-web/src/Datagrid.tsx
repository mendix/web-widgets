import { createElement } from "react";
import { ValueStatus } from "mendix";
import { DatagridContainerProps } from "../typings/DatagridProps";
import DatagridContainer from "./components/Datagrid";
import "./ui/Datagrid.scss";
import { useInitialize } from "./features/initialization/use-initialize";

export default function Datagrid(props: DatagridContainerProps): React.ReactElement {
    const [initState] = useInitialize(props);

    if (initState === undefined || props.datasource.status === ValueStatus.Loading) {
        return <span>Loading</span>;
    }

    return <DatagridContainer {...props} />;
}
