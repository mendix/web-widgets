import { ReactElement } from "react";
import { PlaygroundDataV1, PlaygroundDataV2, usePlaygroundContext } from "@mendix/shared-charts/main";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { ComposedEditor } from "./ComposedEditor";
import { useComposedEditorController } from "../helpers/useComposedEditorController";
import "../ui/Playground.scss";
import { useV2EditorController } from "../helpers/useV2EditorController";

function EditorGen1({ data }: { data: PlaygroundDataV1 }): ReactElement {
    const props = useComposedEditorController(data);

    return <ComposedEditor {...props} />;
}

function EditorGen2({ data }: { data: PlaygroundDataV2 }): ReactElement {
    const props = useV2EditorController(data);

    return <ComposedEditor {...props} />;
}

export function Playground(): ReactElement {
    const ctx = usePlaygroundContext();

    if ("error" in ctx) {
        return <Alert bootstrapStyle="danger">{ctx.error.message}</Alert>;
    }

    const { data } = ctx;

    if (Object.hasOwn(data, "type") && (data as PlaygroundDataV2).type === "editor.data.v2") {
        return <EditorGen2 data={data as PlaygroundDataV2} />;
    }

    return <EditorGen1 data={data as PlaygroundDataV1} />;
}
