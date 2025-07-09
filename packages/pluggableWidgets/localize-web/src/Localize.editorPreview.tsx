import { ReactElement, createElement } from "react";
import { formatKey } from "src/formatKey";
import { LocalizePreviewProps } from "typings/LocalizeProps";

export function preview({ tKey, component: Component }: LocalizePreviewProps): ReactElement {
    return <Component>{formatKey(tKey)}</Component>;
}
