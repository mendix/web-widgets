import { createElement, ReactElement } from "react";

import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { Dropdown as DropdownComponent } from "./components/Dropdown";
import "./ui/Dropdown.scss";

export default function Dropdown(props: ComboboxContainerProps): ReactElement {
    return <DropdownComponent {...props} />;
}
