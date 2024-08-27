import { createElement, ReactElement } from "react";
import { LanguageSelectorPreviewProps } from "typings/LanguageSelectorProps";
import { LanguageSwitcherPreview } from "./components/LanguageSwitcherPreview";

export const preview = (props: LanguageSelectorPreviewProps): ReactElement => {
    return (
        <LanguageSwitcherPreview
            preview
            currentLanguage={{ _guid: "1", value: "Selected language" }}
            style={props.styleObject}
            languageList={[{ _guid: "1", value: "Selected language" }]}
            position={props.position}
            onSelect={undefined}
            trigger={props.trigger}
            className={""}
            tabIndex={0}
            screenReaderLabelCaption={"LanguageSwitcherOptions"}
        ></LanguageSwitcherPreview>
    );
};

export function getPreviewCss(): string {
    return require("./ui/LanguageSelector.scss");
}
