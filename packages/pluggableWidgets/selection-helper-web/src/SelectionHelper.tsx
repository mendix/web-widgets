import { createElement, ReactElement } from "react";
import { SelectionHelperContainerProps } from "../typings/SelectionHelperProps";
import { useSelectionContextValue } from "@mendix/widget-plugin-grid/selection";
import { SelectionHelperComponent } from "./components/SelectionHelperComponent";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";

export function SelectionHelper(props: SelectionHelperContainerProps): ReactElement {
    const contextValue = useSelectionContextValue();

    if (contextValue.hasError) {
        return (
            <Alert bootstrapStyle="danger">
                The Selection Helper widget should be placed within the header section of the Data Grid 2 or the Gallery
                widget with multi-selection enabled.
            </Alert>
        );
    }

    const selection = contextValue.value;

    return (
        <SelectionHelperComponent
            type={props.renderStyle}
            status={selection.status}
            onClick={selection.toggle}
            className={props.class}
            cssStyles={props.style}
        >
            {selection.status === "all" && props.customAllSelected}
            {selection.status === "some" && props.customSomeSelected}
            {selection.status === "none" && props.customNoneSelected}
            {props.checkboxCaption?.value ?? ""}
        </SelectionHelperComponent>
    );
}
