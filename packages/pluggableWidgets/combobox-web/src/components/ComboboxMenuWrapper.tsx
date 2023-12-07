import { useMenuStyle } from "../hooks/useMenuPlacement";
import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { PropsWithChildren, ReactElement, ReactNode, createElement } from "react";
import { NoOptionsPlaceholder } from "./Placeholder";

interface ComboboxMenuWrapperProps extends PropsWithChildren, Partial<UseComboboxPropGetters<string>> {
    isOpen: boolean;
    isEmpty: boolean;
    noOptionsText?: string;
    preview?: boolean;
    showFooter: boolean;
    showFooterContent?: ReactNode;
}

export function ComboboxMenuWrapper(props: ComboboxMenuWrapperProps): ReactElement {
    const { children, isOpen, isEmpty, noOptionsText, preview, getMenuProps, showFooter, showFooterContent } = props;
    const [ref, style] = useMenuStyle<HTMLDivElement>(isOpen, preview);

    return (
        <div
            ref={ref}
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            style={style}
        >
            <ul className="widget-combobox-menu-list" {...getMenuProps?.({}, { suppressRefError: true })}>
                {isOpen ? isEmpty ? <NoOptionsPlaceholder>{noOptionsText}</NoOptionsPlaceholder> : children : null}
            </ul>
            {showFooter && showFooterContent && <div className="widget-combobox-menu-footer">{showFooterContent}</div>}
        </div>
    );
}
