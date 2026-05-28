import { ReactElement } from "react";

import { FileUploaderContainerProps } from "../typings/FileUploaderProps";
import { FileUploaderRoot } from "./components/FileUploaderRoot";
import { RootStoreProvider } from "./utils/useRootStore";
import { TranslationsStoreProvider } from "./utils/useTranslationsStore";

export function FileUploader(props: FileUploaderContainerProps): ReactElement {
    return (
        <TranslationsStoreProvider props={props}>
            <RootStoreProvider props={props}>
                <FileUploaderRoot {...props} />
            </RootStoreProvider>
        </TranslationsStoreProvider>
    );
}
