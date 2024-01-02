import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { PropsWithChildren, ReactElement, ReactNode, createElement } from "react";
import { useMenuStyle } from "../hooks/useMenuStyle";
import { NoOptionsPlaceholder } from "./Placeholder";

interface ComboboxMenuWrapperProps extends PropsWithChildren, Partial<UseComboboxPropGetters<string>> {
    isOpen: boolean;
    isEmpty: boolean;
    noOptionsText?: string;
    alwaysOpen?: boolean;
    showFooter: boolean;
    menuFooterContent?: ReactNode;
}

export function ComboboxMenuWrapper(props: ComboboxMenuWrapperProps): ReactElement {
    const { children, isOpen, isEmpty, noOptionsText, alwaysOpen, getMenuProps, showFooter, menuFooterContent } = props;

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
            <ul className="widget-combobox-menu-list" {...getMenuProps?.({}, { suppressRefError: true })}>
                {isOpen ? isEmpty ? <NoOptionsPlaceholder>{noOptionsText}</NoOptionsPlaceholder> : children : null}
            </ul>
            {showFooter && menuFooterContent && <div className="widget-combobox-menu-footer">{menuFooterContent}</div>}
        </div>
    );
}
