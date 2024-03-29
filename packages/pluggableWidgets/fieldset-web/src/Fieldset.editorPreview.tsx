import { createElement, ReactElement } from "react";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";

import { Fieldset } from "./components/Fieldset";
import { FieldsetPreviewProps } from "../typings/FieldsetProps";

export function preview(props: FieldsetPreviewProps): ReactElement {
    const { className, legend } = props;
    const style = parseStyle(props.style);
    const ContentRenderer = props.content.renderer;

    return (
        <Fieldset className={className} style={style} legend={legend}>
            <ContentRenderer>
                <div />
            </ContentRenderer>
        </Fieldset>
    );
}
