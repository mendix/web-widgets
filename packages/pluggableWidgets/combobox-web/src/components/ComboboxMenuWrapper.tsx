import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, MouseEvent, PropsWithChildren, ReactElement, ReactNode } from "react";
import { InfiniteBodyProps, useInfiniteControl } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import { useMenuStyle } from "../hooks/useMenuStyle";
import { NoOptionsPlaceholder } from "./Placeholder";

interface ComboboxMenuWrapperProps
    extends PropsWithChildren,
        Partial<UseComboboxPropGetters<string>>,
        Pick<InfiniteBodyProps, "hasMoreItems" | "isInfinite" | "setPage"> {
    isOpen: boolean;
    isEmpty: boolean;
    noOptionsText?: string;
    alwaysOpen?: boolean;
    highlightedIndex?: number | null;
    menuHeaderContent?: ReactNode;
    menuFooterContent?: ReactNode;
    onOptionClick?: (e: MouseEvent) => void;
}

function PreventMenuCloseEventHandler(e: React.MouseEvent): void {
    e.stopPropagation();
}

function ForcePreventMenuCloseEventHandler(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
}

export function ComboboxMenuWrapper(props: ComboboxMenuWrapperProps): ReactElement {
    const {
        children,
        isOpen,
        isEmpty,
        noOptionsText,
        alwaysOpen,
        getMenuProps,
        menuHeaderContent,
        menuFooterContent,
        highlightedIndex,
        onOptionClick,
        hasMoreItems,
        isInfinite,
        setPage
    } = props;
    const [ref, style] = useMenuStyle<HTMLDivElement>(isOpen);
    const [trackScrolling] = useInfiniteControl({ hasMoreItems, isInfinite, setPage });

    return (
        <div
            ref={ref}
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            style={
                alwaysOpen
                    ? {
                          display: "block",
                          visibility: "visible",
                          position: "relative"
                      }
                    : style
            }
        >
            {menuHeaderContent && (
                <div
                    className="widget-combobox-menu-header widget-combobox-item"
                    onMouseDown={PreventMenuCloseEventHandler}
                    tabIndex={0}
                >
                    {menuHeaderContent}
                </div>
            )}
            <ul
                className={classNames("widget-combobox-menu-list", {
                    "widget-combobox-menu-highlighted": (highlightedIndex ?? -1) >= 0,
                    "infinite-loading": isInfinite
                })}
                {...getMenuProps?.(
                    {
                        onClick: onOptionClick,
                        onMouseDown: ForcePreventMenuCloseEventHandler,
                        onScroll: isInfinite ? trackScrolling : undefined
                    },
                    { suppressRefError: true }
                )}
            >
                {isOpen ? isEmpty ? <NoOptionsPlaceholder>{noOptionsText}</NoOptionsPlaceholder> : children : null}
            </ul>
            {menuFooterContent && (
                <div tabIndex={0} className="widget-combobox-menu-footer" onMouseDown={PreventMenuCloseEventHandler}>
                    {menuFooterContent}
                </div>
            )}
        </div>
    );
}
