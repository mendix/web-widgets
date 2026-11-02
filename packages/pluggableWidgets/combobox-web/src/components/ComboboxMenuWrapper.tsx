import classNames from "classnames";
import { CSSProperties, HTMLAttributes, MouseEvent, PropsWithChildren, ReactElement, ReactNode, Ref } from "react";
import { NoOptionsPlaceholder } from "./Placeholder";

interface ComboboxMenuWrapperProps extends PropsWithChildren {
    alwaysOpen?: boolean;
    floatingRef?: Ref<HTMLDivElement>;
    floatingStyles?: CSSProperties;
    highlightedIndex?: number | null;
    isEmpty: boolean;
    isLoading: boolean;
    isOpen: boolean;
    lazyLoading: boolean;
    loader: ReactNode;
    menuFooterContent?: ReactNode;
    menuHeaderContent?: ReactNode;
    /** From the Behavior: role, ARIA, ref and the mouse and scroll handlers of the list. */
    menuProps?: HTMLAttributes<HTMLUListElement>;
    noOptionsText?: string;
}

function PreventMenuCloseEventHandler(e: MouseEvent): void {
    e.stopPropagation();
}

export function ComboboxMenuWrapper(props: ComboboxMenuWrapperProps): ReactElement {
    const {
        alwaysOpen,
        children,
        floatingRef,
        floatingStyles,
        highlightedIndex,
        isEmpty,
        isLoading,
        isOpen,
        lazyLoading,
        loader,
        menuFooterContent,
        menuHeaderContent,
        menuProps,
        noOptionsText
    } = props;

    return (
        <div
            ref={alwaysOpen ? undefined : floatingRef}
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            style={
                alwaysOpen
                    ? {
                          display: "block",
                          visibility: "visible",
                          position: "relative"
                      }
                    : floatingStyles
            }
            data-overlay-content={isOpen || undefined}
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
                {...menuProps}
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
