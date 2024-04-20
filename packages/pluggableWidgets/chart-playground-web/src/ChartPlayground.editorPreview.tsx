import { ReactElement, createElement } from "react";
import { Playground } from "./components/Playground";

export function preview(): ReactElement {
    return <Playground />;
}

export function getPreviewCss(): string {
    // html element has no styling by design
    return "";
}
