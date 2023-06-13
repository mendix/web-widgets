import { createElement, ReactElement } from "react";

import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { Combobox as ComboboxComponent } from "./components/Combobox";
import "./ui/Combobox.scss";

export default function Combobox(props: ComboboxContainerProps): ReactElement {
    return <ComboboxComponent {...props} />;
}
