import classNames from "classnames";
import { CSSProperties, MouseEvent, PropsWithChildren, ReactElement, ReactNode, Ref } from "react";
import { classes } from "./classes";
import { legacy } from "./legacyModifiers";
import { NoOptionsPlaceholder } from "./Placeholder";
import { ComboboxBehavior } from "../hooks/useComboboxBehavior";

interface ComboboxMenuWrapperProps extends PropsWithChildren {
    alwaysOpen?: boolean;
    floatingRef?: Ref<HTMLDivElement>;
    floatingStyles?: CSSProperties;
    isEmpty: boolean;
    isLoading: boolean;
    isOpen: boolean;
    loader: ReactNode;
    menuFooterContent?: ReactNode;
    menuHeaderContent?: ReactNode;
    /** From the Behavior: role, ARIA, the state attributes, ref and the mouse and scroll handlers of the list. */
    menuProps?: ReturnType<ComboboxBehavior["getMenuProps"]>;
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
        isEmpty,
        isLoading,
        isOpen,
        loader,
        menuFooterContent,
        menuHeaderContent,
        menuProps,
        noOptionsText
    } = props;

    return (
        <div
            ref={alwaysOpen ? undefined : floatingRef}
            className={classNames(classes.menu, { [legacy.menuHidden]: !isOpen })}
            style={
                alwaysOpen
                    ? {
                          display: "block",
                          visibility: "visible",
                          position: "relative"
                      }
                    : floatingStyles
            }
            data-open={isOpen || undefined}
            data-overlay-content={isOpen || undefined}
        >
            {menuHeaderContent && (
                <div
                    className={classNames(classes.menuHeader, classes.menuItem)}
                    onMouseDown={PreventMenuCloseEventHandler}
                    tabIndex={0}
                >
                    {menuHeaderContent}
                </div>
            )}
            <ul
                className={classNames(classes.menuList, {
                    [legacy.menuListHighlighted]: menuProps?.["data-highlighted"],
                    [legacy.menuListLazy]: menuProps?.["data-lazy"]
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
                <div tabIndex={0} className={classes.menuFooter} onMouseDown={PreventMenuCloseEventHandler}>
                    {menuFooterContent}
                </div>
            )}
        </div>
    );
}
