import classNames from "classnames";
import { createElement, ReactElement, CSSProperties } from "react";

import { PositionEnum, TriggerEnum } from "../../typings/LanguageSelectorProps";
import { LanguageItem } from "../LanguageSelector";

export interface LanguageSwitcherProps {
    preview: boolean;
    currentLanguage: LanguageItem | undefined;
    languageList: LanguageItem[];
    position: PositionEnum;
    onSelect?: (lang: LanguageItem) => void;
    trigger: TriggerEnum;
    className: string;
    style?: CSSProperties;
    tabIndex: number;
    screenReaderLabelCaption?: string;
}
export const LanguageSwitcherPreview = (props: LanguageSwitcherProps): ReactElement => {
    return (
        <div className={classNames(props.className, "widget-language-selector", "popupmenu")} style={props.style}>
            <div className={"popupmenu-trigger popupmenu-trigger-alignment"} role="listbox" tabIndex={props.tabIndex}>
                <span className="current-language-text">{props.currentLanguage?.value || ""}</span>
                <span className="language-arrow" aria-hidden="true">
                    <div className={`arrow-image arrow-down`} />
                </span>
            </div>
            <div className={classNames("popupmenu-menu", `popupmenu-position-${props.position}`)}></div>
        </div>
    );
};
