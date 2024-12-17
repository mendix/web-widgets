import { createElement, Fragment } from "react";
import { DropdownInput, DropdownMenu, DropdownRoot, DropdownToggle } from "./primitives";

interface DropdownProps {
    inputValue: string;
    onInputChange: (value: string) => void;
}

export function Dropdown(props: DropdownProps): React.ReactElement {
    return (
        <Fragment>
            <DropdownRoot className="v-classic">
                <DropdownInput />
                <DropdownToggle />
            </DropdownRoot>
            <DropdownMenu />
        </Fragment>
    );
}
