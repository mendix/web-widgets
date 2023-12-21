import classNames from "classnames";
import { ActionValue } from "mendix";
import { createElement, ReactElement, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BasicItemsType, CustomItemsType, PopupMenuContainerProps, PositionEnum } from "../../typings/PopupMenuProps";
import { useOnClickOutside } from "@mendix/widget-plugin-hooks/useOnClickOutside";
import { useMenuPlacement } from "../utils/useMenuPlacement";

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

export interface MenuProps extends PopupMenuContainerProps {
    anchorElement: HTMLDivElement;
    onCloseRequest: () => void;
    onItemClick: (itemAction: ActionValue) => void;
}
export function Menu(props: MenuProps): ReactElement {
    const popupRef = useRef<HTMLUListElement>(null);
    const anchorElement = props.anchorElement;
    const popupStyles = useMenuPlacement(anchorElement, props.position);

    useOnClickOutside(popupRef, props.onCloseRequest);

    useEffect(() => {
        if (popupRef.current) {
            correctPosition(popupRef.current, props.position);
        }
    }, [popupRef.current, props.position]);

    const menuOptions = createMenuOptions(props, props.onItemClick);

    return createPortal(
        <div className="widget-popupmenu-root">
            <ul
                ref={popupRef}
                style={popupStyles}
                className={classNames("popupmenu-menu", `popupmenu-position-${props.position}`, "popup-portal")}
            >
                {menuOptions}
            </ul>
        </div>,
        anchorElement
    );
}

function checkVisibility(item: BasicItemsType | CustomItemsType): boolean {
    if (Object.prototype.hasOwnProperty.call(item, "visible")) {
        return !!item.visible?.value;
    }
    return true;
}

function createMenuOptions(
    props: PopupMenuContainerProps,
    handleOnClickItem: (itemAction?: ActionValue) => void
): ReactElement[] {
    if (!props.advancedMode) {
        return props.basicItems
            .filter(item => checkVisibility(item))
            .map((item, index) => {
                if (item.itemType === "divider") {
                    return <li key={index} className={"popupmenu-basic-divider"} />;
                } else {
                    const pickedStyle =
                        item.styleClass !== "defaultStyle"
                            ? "popupmenu-basic-item-" + item.styleClass.replace("Style", "")
                            : "";
                    return (
                        <li
                            key={index}
                            className={classNames("popupmenu-basic-item", pickedStyle)}
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOnClickItem(item.action);
                            }}
                        >
                            {item.caption?.value ?? ""}
                        </li>
                    );
                }
            });
    } else {
        return props.customItems
            .filter(item => checkVisibility(item))
            .map((item, index) => (
                <li
                    key={index}
                    className={"popupmenu-custom-item"}
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOnClickItem(item.action);
                    }}
                >
                    {item.content}
                </li>
            ));
    }
}

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
