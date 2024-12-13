import { createElement, ReactElement } from "react";

import { FileUploaderContainerProps } from "../typings/FileUploaderProps";
import { FileUploaderRoot } from "./components/FileUploaderRoot";
import { TranslationsStoreProvider } from "./utils/useTranslationsStore";

export function FileUploader(props: FileUploaderContainerProps): ReactElement {
    return (
        <TranslationsStoreProvider props={props}>
            <FileUploaderRoot {...props} />
        </TranslationsStoreProvider>
    );
}
