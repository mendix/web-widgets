import { createElement, ReactElement } from "react";
import { Menu, MenuProps } from "../components/Menu";
import { PopupContext } from "../components/PopupContext";
import { usePopup } from "../hooks/usePopup";

export function MenuWithContext(props: MenuProps): ReactElement {
    const popup = usePopup(
        { initialOpen: true, open: true, onOpenChange: jest.fn(), placement: props.position },
        props.trigger
    );

    return (
        <PopupContext.Provider value={popup}>
            <Menu {...props} />
        </PopupContext.Provider>
    );
}
