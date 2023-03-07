import { ReactElement, createElement } from "react";

import { DropdownContainerProps } from "../typings/DropdownProps";
import { Dropdown as DropdownComponent } from "./components/Dropdown";
// import "./ui/Dropdown.scss";

export default function Dropdown(props: DropdownContainerProps): ReactElement {
    return <DropdownComponent {...props} />;
}
