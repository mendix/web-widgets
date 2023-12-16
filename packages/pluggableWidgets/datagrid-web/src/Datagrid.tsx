import { createElement } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import Container from "./components/Datagrid";
import { useModelApi } from "./features/model/main";
import { useUnit } from "effector-react";
import "./ui/Datagrid.scss";

export default function Datagrid(props: DatagridContainerProps): React.ReactElement | null {
    const { status, model, actions } = useModelApi(props);

    const loading = useUnit(status) !== "ready";

    if (loading) {
        return null;
    }

    return <Container {...props} model={model} actions={actions} />;
}
