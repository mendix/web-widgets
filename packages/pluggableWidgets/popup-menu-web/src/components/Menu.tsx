import { FloatingFocusManager, useMergeRefs } from "@floating-ui/react";
import classNames from "classnames";
import { ActionValue } from "mendix";
import { createElement, forwardRef, ReactElement, RefObject } from "react";
import { BasicItemsType, CustomItemsType, PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { usePopupContext } from "../hooks/usePopupContext";

export interface MenuProps extends PopupMenuContainerProps {
    onItemClick: (itemAction: ActionValue) => void;
}

export const Menu = forwardRef((props: MenuProps, propRef: RefObject<HTMLDivElement>): ReactElement | null => {
    const { context: floatingContext, floatingStyles, getFloatingProps, modal, refs } = usePopupContext();
    const ref = useMergeRefs([refs.setFloating, propRef]);

    if (!floatingContext.open) {
        return null;
    }

    const menuOptions = createMenuOptions(props, props.onItemClick);

    return (
        <FloatingFocusManager context={floatingContext} modal={modal}>
            <div className="widget-popupmenu-root">
                <ul
                    ref={ref}
                    style={{ ...floatingStyles, ...props.style }}
                    {...getFloatingProps?.({ className: "popupmenu-menu" })}
                >
                    {menuOptions}
                </ul>
            </div>
        </FloatingFocusManager>
    );
});

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
