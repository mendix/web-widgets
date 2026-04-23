import { FloatingFocusManager, useMergeRefs, useInteractions } from "@floating-ui/react";
import classNames from "classnames";
import { ActionValue } from "mendix";
import { forwardRef, ReactElement, RefObject, MutableRefObject } from "react";
import { BasicItemsType, CustomItemsType, PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { usePopupContext } from "../hooks/usePopupContext";

type GetItemProps = ReturnType<typeof useInteractions>["getItemProps"];

export interface MenuProps extends PopupMenuContainerProps {
    onItemClick: (itemAction: ActionValue) => void;
    listRef: MutableRefObject<Array<HTMLElement | null>>;
    activeIndex: number | null;
}

export const Menu = forwardRef((props: MenuProps, propRef: RefObject<HTMLDivElement>): ReactElement | null => {
    const { context: floatingContext, floatingStyles, getFloatingProps, getItemProps, modal, refs, open } =
        usePopupContext();
    const ref = useMergeRefs([refs.setFloating, propRef]);

    if (!open) {
        return null;
    }

    const menuOptions = createMenuOptions(props, props.onItemClick, props.listRef, props.activeIndex, getItemProps);

    return (
        <FloatingFocusManager context={floatingContext} modal={modal}>
            <div className="widget-popupmenu-root">
                <ul
                    ref={ref}
                    role="menu"
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
    props: MenuProps,
    handleOnClickItem: (itemAction?: ActionValue) => void,
    listRef: MutableRefObject<Array<HTMLElement | null>>,
    activeIndex: number | null,
    getItemProps?: GetItemProps
): ReactElement[] {
    let itemIndex = 0;

    if (!props.advancedMode) {
        return props.basicItems
            .filter(item => checkVisibility(item))
            .map((item, index) => {
                if (item.itemType === "divider") {
                    return <li key={index} role="separator" className={"popupmenu-basic-divider"} />;
                } else {
                    const pickedStyle =
                        item.styleClass !== "defaultStyle"
                            ? "popupmenu-basic-item-" + item.styleClass.replace("Style", "")
                            : "";
                    const currentItemIndex = itemIndex++;
                    const isActive = currentItemIndex === activeIndex;
                    return (
                        <li
                            key={index}
                            ref={el => {
                                listRef.current[currentItemIndex] = el;
                            }}
                            role="menuitem"
                            tabIndex={isActive ? 0 : -1}
                            className={classNames("popupmenu-basic-item", pickedStyle)}
                            {...getItemProps?.({
                                onClick(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleOnClickItem(item.action);
                                },
                                onKeyDown(e) {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleOnClickItem(item.action);
                                    }
                                }
                            })}
                        >
                            {item.caption?.value ?? ""}
                        </li>
                    );
                }
            });
    } else {
        return props.customItems
            .filter(item => checkVisibility(item))
            .map((item, index) => {
                const currentItemIndex = itemIndex++;
                const isActive = currentItemIndex === activeIndex;
                return (
                    <li
                        key={index}
                        ref={el => {
                            listRef.current[currentItemIndex] = el;
                        }}
                        role="menuitem"
                        tabIndex={isActive ? 0 : -1}
                        className={"popupmenu-custom-item"}
                        {...getItemProps?.({
                            onClick(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOnClickItem(item.action);
                            },
                            onKeyDown(e) {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleOnClickItem(item.action);
                                }
                            }
                        })}
                    >
                        {item.content}
                    </li>
                );
            });
    }
}
