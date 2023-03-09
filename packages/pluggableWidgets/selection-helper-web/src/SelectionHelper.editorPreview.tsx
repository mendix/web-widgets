import { ReactElement, createElement } from "react";
import { SelectionHelperPreviewProps } from "../typings/SelectionHelperProps";

export function preview(props: SelectionHelperPreviewProps): ReactElement {
    return <div>{JSON.stringify(props)}</div>;
}

export function getPreviewCss(): string {
    return "";
}
