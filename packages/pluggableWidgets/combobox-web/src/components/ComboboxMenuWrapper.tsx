import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, MouseEvent, PropsWithChildren, ReactElement, ReactNode } from "react";
import { useMenuStyle } from "../hooks/useMenuStyle";
import { NoOptionsPlaceholder } from "./Placeholder";

interface ComboboxMenuWrapperProps extends PropsWithChildren, Partial<UseComboboxPropGetters<string>> {
    alwaysOpen?: boolean;
    highlightedIndex?: number | null;
    isEmpty: boolean;
    isLoading: boolean;
    isOpen: boolean;
    lazyLoading: boolean;
    loader: JSX.Element;
    menuFooterContent?: ReactNode;
    menuHeaderContent?: ReactNode;
    noOptionsText?: string;
    onOptionClick?: (e: MouseEvent) => void;
    onScroll?: (e: any) => void;
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
        alwaysOpen,
        children,
        getMenuProps,
        highlightedIndex,
        isEmpty,
        isLoading,
        isOpen,
        lazyLoading,
        loader,
        menuFooterContent,
        menuHeaderContent,
        noOptionsText,
        onOptionClick,
        onScroll
    } = props;

    const [ref, style] = useMenuStyle<HTMLDivElement>(isOpen);

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
                    "widget-combobox-menu-lazy-scroll": lazyLoading && !isEmpty
                })}
                {...getMenuProps?.(
                    {
                        onClick: onOptionClick,
                        onMouseDown: ForcePreventMenuCloseEventHandler,
                        onScroll
                    },
                    { suppressRefError: true }
                )}
            >
                {isOpen ? (
                    isEmpty && !isLoading ? (
                        <NoOptionsPlaceholder>{noOptionsText}</NoOptionsPlaceholder>
                    ) : (
                        children
                    )
                ) : null}
                {loader}
            </ul>
            {menuFooterContent && (
                <div tabIndex={0} className="widget-combobox-menu-footer" onMouseDown={PreventMenuCloseEventHandler}>
                    {menuFooterContent}
                </div>
            )}
        </div>
    );
}
