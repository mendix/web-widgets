import { ReactElement, createElement } from "react";
import { AppTranslationsProviderPreviewProps } from "../typings/AppTranslationsProviderProps";

export function preview({ children }: AppTranslationsProviderPreviewProps): ReactElement {
    return (
        <children.renderer>
            <div />
        </children.renderer>
    );
}
