import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { PropsWithChildren, ReactElement, ReactNode, createElement, MouseEvent } from "react";
import { useMenuStyle } from "../hooks/useMenuStyle";
import { NoOptionsPlaceholder } from "./Placeholder";

interface ComboboxMenuWrapperProps extends PropsWithChildren, Partial<UseComboboxPropGetters<string>> {
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
        onOptionClick
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
                    "widget-combobox-menu-highlighted": (highlightedIndex ?? -1) >= 0
                })}
                {...getMenuProps?.(
                    {
                        onClick: onOptionClick,
                        onMouseDown: ForcePreventMenuCloseEventHandler
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
