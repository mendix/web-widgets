import { createElement, ReactElement } from "react";

import { ComboboxContainerProps } from "../typings/ComboboxProps";
import { Combobox as SingleSelection } from "./components/Combobox";
import { MultiSelection } from "./components/MultiSelection/MultiSelection";

import "./ui/Combobox.scss";

export default function Combobox(props: ComboboxContainerProps): ReactElement {
    return props.attributeAssociation?.type === "ReferenceSet" ? (
        <MultiSelection {...props} />
    ) : (
        <SingleSelection {...props} />
    );
}
