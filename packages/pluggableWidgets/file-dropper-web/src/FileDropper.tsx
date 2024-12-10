import { createElement, ReactElement } from "react";

import { FileDropperContainerProps } from "../typings/FileDropperProps";
import { FileDropperRoot } from "./components/FileDropperRoot";

export function FileDropper(props: FileDropperContainerProps): ReactElement {
    return <FileDropperRoot {...props} />;
}
