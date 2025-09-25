import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { useSelectionContextValue } from "@mendix/widget-plugin-grid/selection";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { SelectionHelperContainerProps } from "../typings/SelectionHelperProps";
import { SelectionHelperComponent } from "./components/SelectionHelperComponent";

const SelectionHelper = observer(function SelectionHelper(props: SelectionHelperContainerProps): ReactElement {
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
            status={selection.selectionStatus}
            onClick={() => selection.togglePageSelection()}
            className={props.class}
            cssStyles={props.style}
        >
            {selection.selectionStatus === "all" && props.customAllSelected}
            {selection.selectionStatus === "some" && props.customSomeSelected}
            {selection.selectionStatus === "none" && props.customNoneSelected}
            {props.checkboxCaption?.value ?? ""}
        </SelectionHelperComponent>
    );
});

export { SelectionHelper };
