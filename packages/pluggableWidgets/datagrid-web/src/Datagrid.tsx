import { createElement } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import DatagridContainer from "./components/Datagrid";
import "./ui/Datagrid.scss";

export default function Datagrid(props: DatagridContainerProps): React.ReactElement {
    return <DatagridContainer {...props} />;
}
