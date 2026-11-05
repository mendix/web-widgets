import classNames from "classnames";
import { CSSProperties, MouseEvent, PropsWithChildren, ReactElement, ReactNode, Ref } from "react";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";
import { legacy } from "../legacyModifiers";

export interface MenuProps extends PropsWithChildren {
    isOpen: boolean;
    /** Editor preview: rendered inline instead of floating. */
    alwaysOpen?: boolean;
    /** The popover's floating element. */
    floatingRef?: Ref<HTMLDivElement>;
    floatingStyles?: CSSProperties;
    /** From the Behavior: role, ARIA, the state attributes, ref and the mouse and scroll handlers of the list. */
    menuProps: ReturnType<ComboboxBehavior["getMenuProps"]>;
    /** Rendered above the list, styled as an item: the select-all control in multi mode. */
    header?: ReactNode;
    /** Rendered below the list: the configured footer widgets. */
    footer?: ReactNode;
}

function preventMenuClose(e: MouseEvent): void {
    e.stopPropagation();
}

/** The popover: header, the option list that receives the options, loader and empty state as children, and footer. */
export function Menu({
    isOpen,
    alwaysOpen,
    floatingRef,
    floatingStyles,
    menuProps,
    header,
    footer,
    children
}: MenuProps): ReactElement {
    const classes = useComboboxClasses();

    return (
        <div
            ref={alwaysOpen ? undefined : floatingRef}
            className={classNames(classes.menu, { [legacy.menuHidden]: !isOpen })}
            style={alwaysOpen ? { display: "block", visibility: "visible", position: "relative" } : floatingStyles}
            data-open={isOpen || undefined}
            data-overlay-content={isOpen || undefined}
        >
            {header && (
                <div
                    className={classNames(classes.menuHeader, classes.menuItem)}
                    onMouseDown={preventMenuClose}
                    tabIndex={0}
                >
                    {header}
                </div>
            )}
            <ul
                className={classNames(classes.menuList, {
                    [legacy.menuListHighlighted]: menuProps["data-highlighted"],
                    [legacy.menuListLazy]: menuProps["data-lazy"]
                })}
                {...menuProps}
            >
                {children}
            </ul>
            {footer && (
                <div tabIndex={0} className={classes.menuFooter} onMouseDown={preventMenuClose}>
                    {footer}
                </div>
            )}
        </div>
    );
}
