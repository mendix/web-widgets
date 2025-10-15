import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ReactElement, useMemo } from "react";
import { CheckboxRadioSelectionPreviewProps } from "../typings/CheckboxRadioSelectionProps";
import { RadioSelection } from "./components/RadioSelection/RadioSelection";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { MultiSelector, SelectionBaseProps, SingleSelector } from "./helpers/types";
import { StaticPreviewSelector } from "./helpers/Static/Preview/StaticPreviewSelector";
import {
    DatabaseMultiPreviewSelector,
    DatabasePreviewSelector
} from "./helpers/Database/Preview/DatabasePreviewSelector";
import { AssociationPreviewSelector } from "./helpers/Association/Preview/AssociationPreviewSelector";
import "./ui/CheckboxRadioSelection.scss";
import "./ui/CheckboxRadioSelectionPreview.scss";
import { CheckboxSelection } from "./components/CheckboxSelection/CheckboxSelection";

export const preview = (props: CheckboxRadioSelectionPreviewProps): ReactElement => {
    const id = generateUUID().toString();
    const commonProps: Omit<SelectionBaseProps<null>, "selector"> = {
        tabIndex: 1,
        inputId: id,
        labelId: `${id}-label`,
        readOnlyStyle: props.readOnlyStyle,
        ariaRequired: dynamic(false),
        ariaLabel: dynamic(""),
        groupName: dynamic(`${id}-group`),
        noOptionsText: "No options available"
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const selector: SingleSelector | MultiSelector = useMemo(() => {
        if (props.source === "static") {
            return new StaticPreviewSelector(props);
        }
        if (props.source === "database") {
            if (props.optionsSourceDatabaseItemSelection === "Multi") {
                return new DatabaseMultiPreviewSelector(props);
            } else {
                return new DatabasePreviewSelector(props);
            }
        }
        return new AssociationPreviewSelector(props);
    }, [props]);

    return (
        <div className="widget-checkbox-radio-selection widget-checkbox-radio-selection-editor-preview">
            {selector.type === "single" ? (
                <RadioSelection selector={selector} {...commonProps} />
            ) : (
                <CheckboxSelection selector={selector} {...commonProps} />
            )}
        </div>
    );
};
