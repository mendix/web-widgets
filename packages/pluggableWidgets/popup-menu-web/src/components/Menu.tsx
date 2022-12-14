import classNames from "classnames";
import {
    isBehindElement,
    isBehindRandomElement,
    isElementPartiallyOffScreen,
    isElementVisibleByUser,
    moveAbsoluteElementOnScreen,
    useHandleOnClickOutsideElement,
    unBlockAbsoluteElementLeft,
    unBlockAbsoluteElementBottom,
    unBlockAbsoluteElementRight,
    unBlockAbsoluteElementTop
} from "../utils/document";
import { ReactElement, createElement, useCallback, useEffect, useRef, CSSProperties, RefObject } from "react";
import { createPortal } from "react-dom";
import { executeAction } from "@mendix/pluggable-widgets-commons";
import { usePositionObserver } from "@mendix/pluggable-widgets-commons/components/web";
import { ActionValue } from "mendix";
import { PopupMenuContainerProps, PositionEnum, BasicItemsType, CustomItemsType } from "../../typings/PopupMenuProps";

export interface MenuProps extends PopupMenuContainerProps {
    triggerRef: RefObject<HTMLDivElement>;
    visibility: boolean;
    setVisibility: (visibility: boolean) => void;
}
export function Menu(props: MenuProps): ReactElement {
    const popupRef = useRef<HTMLDivElement>(null);
    const triggerRef = props.triggerRef;
    const visibility = props.visibility;
    const triggerPosition = usePositionObserver(triggerRef.current, visibility);

    const handleOnClickItem = useCallback((itemAction?: ActionValue): void => {
        props.setVisibility(false);
        executeAction(itemAction);
    }, []);

    useHandleOnClickOutsideElement(triggerRef, () => props.setVisibility(false));

    useEffect(() => {
        if (popupRef.current && triggerRef.current) {
            popupRef.current.style.display = visibility ? "flex" : "none";
            if (visibility) {
                correctPosition(popupRef.current, props.position);
            }
        }
    }, [props.position, visibility, triggerRef]);

    const popupStyles: CSSProperties =
        props.position === "bottom" && triggerPosition
            ? {
                  position: "fixed",
                  top: triggerPosition.height + triggerPosition.top,
                  left: triggerPosition.left,
                  transform: "none",
                  bottom: "initial"
              }
            : props.position === "right" && triggerPosition
            ? {
                  position: "fixed",
                  top: triggerPosition.top,
                  left: triggerPosition.left + triggerPosition.width,
                  transform: "none",
                  bottom: "initial"
              }
            : { position: "fixed", top: triggerPosition?.top, left: triggerPosition?.left };

    const menuOptions = createMenuOptions(props, handleOnClickItem);

    return createPortal(
        <div className="widget-popupmenu-root">
            <div
                ref={popupRef}
                style={popupStyles}
                className={classNames("popupmenu-menu", `popupmenu-position-${props.position}`, "popup-portal")}
            >
                {menuOptions}
            </div>
        </div>,
        document.body
    );
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
                    return <div key={index} className={"popupmenu-basic-divider"} />;
                } else {
                    const pickedStyle =
                        item.styleClass !== "defaultStyle"
                            ? "popupmenu-basic-item-" + item.styleClass.replace("Style", "")
                            : "";
                    return (
                        <div
                            key={index}
                            className={classNames("popupmenu-basic-item", pickedStyle)}
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOnClickItem(item.action);
                            }}
                        >
                            {item.caption?.value ?? ""}
                        </div>
                    );
                }
            });
    } else {
        return props.customItems
            .filter(item => checkVisibility(item))
            .map((item, index) => (
                <div
                    key={index}
                    className={"popupmenu-custom-item"}
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOnClickItem(item.action);
                    }}
                >
                    {item.content}
                </div>
            ));
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
