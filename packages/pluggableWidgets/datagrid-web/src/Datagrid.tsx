import { createElement } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import Container from "./components/Datagrid";
import { useModelApi } from "./features/model/main";
import { useGate, useUnit } from "effector-react";

export default function Datagrid(props: DatagridContainerProps): React.ReactElement {
    const { gate, status, model, actions } = useModelApi();
    useGate(gate, props);

    const loading = useUnit(status) !== "ready";

    if (loading) {
        return <div>Loading...</div>;
    }

    return <Container {...props} model={model} actions={actions} />;
}
