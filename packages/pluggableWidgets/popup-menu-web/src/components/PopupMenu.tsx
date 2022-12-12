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
import {
    ReactElement,
    useState,
    createElement,
    useCallback,
    useEffect,
    useRef,
    SyntheticEvent,
    CSSProperties
} from "react";
import { createPortal } from "react-dom";
import { executeAction } from "@mendix/pluggable-widgets-commons";
import { usePositionObserver } from "@mendix/pluggable-widgets-commons/components/web";
import { ActionValue } from "mendix";

import { PopupMenuContainerProps, PositionEnum, BasicItemsType, CustomItemsType } from "../../typings/PopupMenuProps";

export interface PopupMenuProps extends PopupMenuContainerProps {
    preview?: boolean;
}

export function PopupMenu(props: PopupMenuProps): ReactElement {
    const preview = !!props.preview;
    const [visibility, setVisibility] = useState(preview && props.menuToggle);
    const triggerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const position = usePositionObserver(triggerRef.current, visibility);

    if (!preview) {
        useHandleOnClickOutsideElement(triggerRef, () => setVisibility(false));
    }

    const handleOnClickTrigger = useCallback(
        (e: SyntheticEvent<HTMLElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            setVisibility(prev => !prev);
        },
        [setVisibility]
    );

    const handleOnHoverTrigger = useCallback(
        (e: SyntheticEvent<HTMLElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            setVisibility(true);
        },
        [setVisibility]
    );

    const handleOnClickItem = useCallback((itemAction?: ActionValue): void => {
        setVisibility(false);
        executeAction(itemAction);
    }, []);

    const menuOptions = createMenuOptions(props, handleOnClickItem);
    const onHover =
        props.trigger === "onhover" && !preview
            ? {
                  onMouseEnter: handleOnHoverTrigger
              }
            : {};
    const onClick =
        props.trigger === "onclick" && !preview
            ? {
                  onClick: handleOnClickTrigger
              }
            : {};

    useEffect(() => {
        if (popupRef.current && triggerRef.current) {
            popupRef.current.style.display = visibility ? "flex" : "none";
            if (visibility) {
                correctPosition(popupRef.current, props.position);
            }
        }
    }, [props.position, visibility]);
    useEffect(() => {
        setVisibility(props.menuToggle);
    }, [props.menuToggle]);

    const popupStyles: CSSProperties =
        props.position === "bottom" && position
            ? {
                  position: "fixed",
                  top: position.height + position.top,
                  left: position.left,
                  transform: "none",
                  bottom: "initial"
              }
            : props.position === "right" && position
            ? {
                  position: "fixed",
                  top: position.top,
                  left: position.left + position.width,
                  transform: "none",
                  bottom: "initial"
              }
            : { position: "fixed", top: position?.top, left: position?.left };

    const PopupPortal = createPortal(
        <div className="widget-popupmenu-root">
            <div
                ref={popupRef}
                style={popupStyles}
                className={classNames("popupmenu-menu", `popupmenu-position-${props.position}`)}
            >
                {menuOptions}
            </div>
        </div>,
        document.body
    );

    return (
        <div ref={triggerRef} className={classNames("popupmenu", props.class)} {...onHover} {...onClick}>
            <div className={"popupmenu-trigger"}>{props.menuTrigger}</div>
            {PopupPortal}
        </div>
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
