import classNames from "classnames";
import { ActionValue } from "mendix";
import { createElement, ReactElement, useRef } from "react";
import { createPortal } from "react-dom";
import { BasicItemsType, CustomItemsType, PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { useHandleOnClickOutsideElement } from "../utils/useHandleOnClickOutsideElement";
import { useMenuPlacement } from "../utils/useMenuPlacement";

export interface MenuProps extends PopupMenuContainerProps {
    anchorElement: HTMLDivElement;
    onCloseRequest: () => void;
    onItemClick: (itemAction: ActionValue) => void;
}
export function Menu(props: MenuProps): ReactElement {
    const popupRef = useRef<HTMLDivElement>(null);
    const anchorElement = props.anchorElement;
    const popupStyles = useMenuPlacement(anchorElement, props.position);

    useHandleOnClickOutsideElement(popupRef, props.onCloseRequest);

    const menuOptions = createMenuOptions(props, props.onItemClick);

    return createPortal(
        <div className="widget-popupmenu-root">
            <div
                ref={popupRef}
                style={popupStyles}
                className={classNames(
                    "popupmenu-menu",
                    `popupmenu-position-${props.position}`,
                    "popup-portal",
                    props.class
                )}
            >
                {menuOptions}
            </div>
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
