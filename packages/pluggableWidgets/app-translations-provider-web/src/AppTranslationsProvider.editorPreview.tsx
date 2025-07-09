import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { AppTranslationsProviderPreviewProps } from "../typings/AppTranslationsProviderProps";

export function preview({ sampleText }: AppTranslationsProviderPreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/AppTranslationsProvider.css");
}
