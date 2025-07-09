import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { AppTranslationsProviderContainerProps } from "../typings/AppTranslationsProviderProps";

export function AppTranslationsProvider({ sampleText }: AppTranslationsProviderContainerProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText ? sampleText : "World"} />;
}
