import classNames from "classnames";
import { createElement, ReactElement, useEffect, useRef } from "react";
import {
    isBehindElement,
    isBehindRandomElement,
    isElementPartiallyOffScreen,
    isElementVisibleByUser,
    moveAbsoluteElementOnScreen,
    unBlockAbsoluteElementBottom,
    unBlockAbsoluteElementLeft,
    unBlockAbsoluteElementRight,
    unBlockAbsoluteElementTop
} from "../utils/document";
import { PositionEnum, TriggerEnum } from "../../typings/LanguageSelectorProps";
import { LanguageItem } from "../LanguageSelector";
import { useSelect } from "downshift";

export interface LanguageSwitcherProps {
    preview: boolean;
    currentLanguage: LanguageItem | undefined;
    languageList: LanguageItem[];
    position: PositionEnum;
    onSelect?: (lang: LanguageItem) => void;
    trigger: TriggerEnum;
    className: string;
    tabIndex: number;
    screenReaderLabelCaption?: string;
}
export const LanguageSwitcher = (props: LanguageSwitcherProps): ReactElement => {
    const { languageList } = props;
    const ref = useRef<HTMLDivElement>(null);

    function itemToString(item: LanguageItem) {
        return item ? item.value : "";
    }
    const { isOpen, selectItem, highlightedIndex, getMenuProps, getItemProps, getToggleButtonProps } = useSelect({
        items: languageList,
        itemToString
    });

    useEffect(() => {
        if (props.currentLanguage === undefined || props.preview) {
            return;
        }
        selectItem(props.currentLanguage);
    }, [props.currentLanguage]);

    useEffect(() => {
        const element = ref.current?.querySelector(".popupmenu-menu") as HTMLDivElement | null;
        if (element) {
            element.style.display = isOpen ? "flex" : "none";
            if (isOpen) {
                correctPosition(element, props.position);
            }
        }
    }, [props.position, isOpen]);

    return props.preview ? (
        <div ref={ref} className={classNames(props.className, "widget-language-selector", "popupmenu")}>
            <div className={"popupmenu-trigger popupmenu-trigger-alignment"} role="listbox" tabIndex={props.tabIndex}>
                <span className="current-language-text">{props.currentLanguage?.value || ""}</span>
                <span className="language-arrow" aria-hidden="true">
                    <div className={`arrow-image ${isOpen ? "arrow-up" : "arrow-down"}`} />
                </span>
            </div>
            <div className={classNames("popupmenu-menu", `popupmenu-position-${props.position}`)}></div>
        </div>
    ) : (
        <div ref={ref} className={classNames(props.className, "widget-language-selector", "popupmenu")}>
            <div
                className={"popupmenu-trigger popupmenu-trigger-alignment"}
                role="listbox"
                tabIndex={props.tabIndex}
                {...getToggleButtonProps({
                    onKeyDown: event => {
                        if (!isOpen || highlightedIndex === null) {
                            return;
                        }
                        if (event.key === "Enter" || event.key === "Tab" || event.key === "Spacebar") {
                            if (props.onSelect) {
                                return props.onSelect(languageList[highlightedIndex]);
                            }
                        }
                    }
                })}
            >
                <span className="current-language-text">{props.currentLanguage?.value || ""}</span>
                <span className="language-arrow" aria-hidden="true">
                    <div className={`arrow-image ${isOpen ? "arrow-up" : "arrow-down"}`} />
                </span>
            </div>
            <div className={classNames("popupmenu-menu", `popupmenu-position-${props.position}`)} {...getMenuProps()}>
                {languageList.map((item, index) => (
                    <div
                        key={item._guid}
                        className={`popupmenu-basic-item ${props.currentLanguage === item ? "active" : ""} ${
                            highlightedIndex === index ? "highlighted" : ""
                        } `}
                        {...getItemProps({ item, index })}
                        onClick={() => {
                            if (props.onSelect) {
                                return props.onSelect(item);
                            }
                        }}
                    >
                        {item.value}
                    </div>
                ))}
            </div>
        </div>
    );
};

function correctPosition(element: HTMLElement, position: PositionEnum): void {
    const dynamicDocument: Document = element.ownerDocument;
    const dynamicWindow = dynamicDocument.defaultView as Window;
    let boundingRect: DOMRect = element.getBoundingClientRect();
    const isOffScreen = isElementPartiallyOffScreen(dynamicWindow, boundingRect);
    if (isOffScreen) {
        moveAbsoluteElementOnScreen(dynamicWindow, element, boundingRect);
    }

    boundingRect = element.getBoundingClientRect();
    const blockingElement = isBehindRandomElement(dynamicDocument, element, boundingRect, 3, "popupmenu");
    if (blockingElement && isElementVisibleByUser(dynamicDocument, dynamicWindow, blockingElement)) {
        unBlockAbsoluteElement(element, boundingRect, blockingElement.getBoundingClientRect(), position);
    } else if (blockingElement) {
        let node = blockingElement;
        do {
            if (isBehindElement(element, node, 3) && isElementVisibleByUser(dynamicDocument, dynamicWindow, node)) {
                return unBlockAbsoluteElement(element, boundingRect, node.getBoundingClientRect(), position);
            } else if (node.parentElement) {
                node = node.parentElement as HTMLElement;
            } else {
                break;
            }
        } while (node.parentElement);
    }
}

function unBlockAbsoluteElement(
    element: HTMLElement,
    boundingRect: DOMRect,
    blockingElementRect: DOMRect,
    position: PositionEnum
): void {
    switch (position) {
        case "left":
            unBlockAbsoluteElementLeft(element, boundingRect, blockingElementRect);
            unBlockAbsoluteElementBottom(element, boundingRect, blockingElementRect);
            break;
        case "right":
            unBlockAbsoluteElementRight(element, boundingRect, blockingElementRect);
            unBlockAbsoluteElementBottom(element, boundingRect, blockingElementRect);
            break;
        case "top":
            unBlockAbsoluteElementTop(element, boundingRect, blockingElementRect);
            break;
        case "bottom":
            unBlockAbsoluteElementBottom(element, boundingRect, blockingElementRect);
            break;
    }
}
