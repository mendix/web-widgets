import { PlaygroundData, usePlaygroundContext } from "@mendix/shared-charts/main";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { createElement } from "react";
import { useComposedEditorController } from "../helpers/useComposedEditorController";
import { ComposedEditor } from "./ComposedEditor";
import "../ui/Playground.scss";

function Editor({ data }: { data: PlaygroundData }): React.ReactElement {
    const props = useComposedEditorController(data);

    return <ComposedEditor {...props} />;
}

export function Playground(): React.ReactElement {
    const ctx = usePlaygroundContext();

    if ("error" in ctx) {
        return <Alert bootstrapStyle="danger">{ctx.error.message}</Alert>;
    }

    return <Editor data={ctx.data} />;
}
