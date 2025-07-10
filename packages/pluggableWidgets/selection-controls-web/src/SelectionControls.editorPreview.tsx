import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ReactElement, createElement, useMemo } from "react";
import { SelectionControlsPreviewProps } from "../typings/SelectionControlsProps";
import { RadioSelection } from "./components/RadioSelection/RadioSelection";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { SingleSelector, SelectionBaseProps } from "./helpers/types";
import "./ui/SelectionControls.scss";

// Preview selector implementation - simplified for preview
class PreviewSelector implements SingleSelector {
    type = "single" as const;
    status = "available" as const;
    readOnly = false;
    validation = undefined;
    clearable = false;
    currentId = null;
    customContentType = "no" as const;

    constructor(_props: SelectionControlsPreviewProps) {}

    updateProps() {}
    setValue() {}
    onEnterEvent() {}
    onLeaveEvent() {}

    options = {
        status: "available" as const,
        searchTerm: "",
        getAll: () => ["Option 1", "Option 2", "Option 3"],
        setSearchTerm: () => {},
        onAfterSearchTermChange: () => {},
        isLoading: false,
        _updateProps: () => {},
        _optionToValue: () => undefined,
        _valueToOption: () => null
    };

    caption = {
        get: (value: string | null) => value || "Preview Option",
        render: (value: string | null) => value || "Preview Option",
        emptyCaption: "Select an option"
    };
}

export const preview = (props: SelectionControlsPreviewProps): ReactElement => {
    const id = generateUUID().toString();
    const commonProps: Omit<SelectionBaseProps<null>, "selector"> = {
        tabIndex: 1,
        inputId: id,
        labelId: `${id}-label`,
        readOnlyStyle: props.readOnlyStyle,
        ariaRequired: dynamic(false),
        a11yConfig: {
            ariaLabels: {
                clearSelection: props.clearButtonAriaLabel,
                removeSelection: props.removeValueAriaLabel
            },
            a11yStatusMessage: {
                a11ySelectedValue: props.a11ySelectedValue,
                a11yOptionsAvailable: props.a11yOptionsAvailable,
                a11yInstructions: props.a11yInstructions
            }
        }
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const selector: SingleSelector = useMemo(() => {
        return new PreviewSelector(props);
    }, [props]);

    return (
        <div className="widget-selection-controls widget-selection-controls-editor-preview">
            <RadioSelection selector={selector} {...commonProps} />
        </div>
    );
};
