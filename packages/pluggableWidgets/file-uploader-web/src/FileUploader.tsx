import { createElement, ReactElement } from "react";

import { FileUploaderContainerProps } from "../typings/FileUploaderProps";
import { FileUploaderRoot } from "./components/FileUploaderRoot";

export function FileUploader(props: FileUploaderContainerProps): ReactElement {
    return <FileUploaderRoot {...props} />;
}
