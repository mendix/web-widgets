import { createElement, ReactElement } from "react";

import { SwitchPreviewProps } from "../typings/SwitchProps";
import Switch from "./components/Switch";

export function preview(props: SwitchPreviewProps): ReactElement {
    return <Switch id="switch-preview" validation={undefined} editable={!props.readOnly} isChecked />;
}

export function getPreviewCss(): string {
    return require("./ui/switch-main.scss");
}
