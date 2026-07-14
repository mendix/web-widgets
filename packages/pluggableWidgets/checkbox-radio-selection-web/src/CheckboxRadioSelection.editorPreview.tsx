import type { DynamicValue } from "mendix";
import { ReactElement, useMemo } from "react";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { CheckboxRadioSelectionPreviewProps } from "../typings/CheckboxRadioSelectionProps";
import { CheckboxSelection } from "./components/CheckboxSelection/CheckboxSelection";
import { RadioSelection } from "./components/RadioSelection/RadioSelection";
import { AssociationPreviewSelector } from "./helpers/Association/Preview/AssociationPreviewSelector";
import {
    DatabaseMultiPreviewSelector,
    DatabasePreviewSelector
} from "./helpers/Database/Preview/DatabasePreviewSelector";
import { StaticPreviewSelector } from "./helpers/Static/Preview/StaticPreviewSelector";
import { MultiSelector, SelectionBaseProps, SingleSelector } from "./helpers/types";
import "./ui/CheckboxRadioSelection.scss";
import "./ui/CheckboxRadioSelectionPreview.scss";

const available = <T,>(value: T): DynamicValue<T> =>
    ({
        status: "available",
        value
    }) as DynamicValue<T>;

export const preview = (props: CheckboxRadioSelectionPreviewProps): ReactElement => {
    const id = generateUUID().toString();
    const commonProps: Omit<SelectionBaseProps<null>, "selector"> = {
        tabIndex: 1,
        inputId: id,
        labelId: `${id}-label`,
        readOnlyStyle: props.readOnlyStyle,
        ariaRequired: available(false),
        ariaLabel: available(""),
        groupName: available(`${id}-group`),
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
