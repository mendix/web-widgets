import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ReactElement, createElement, useMemo } from "react";
import { SelectionControlsPreviewProps } from "../typings/SelectionControlsProps";
import { RadioSelection } from "./components/RadioSelection/RadioSelection";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { SingleSelector, SelectionBaseProps } from "./helpers/types";
import { StaticPreviewSelector } from "./helpers/Static/Preview/StaticPreviewSelector";
import { DatabasePreviewSelector } from "./helpers/Database/Preview/DatabasePreviewSelector";
import { AssociationPreviewSelector } from "./helpers/Association/Preview/AssociationPreviewSelector";
import "./ui/SelectionControls.scss";

export const preview = (props: SelectionControlsPreviewProps): ReactElement => {
    const id = generateUUID().toString();
    const commonProps: Omit<SelectionBaseProps<null>, "selector"> = {
        tabIndex: 1,
        inputId: id,
        labelId: `${id}-label`,
        readOnlyStyle: props.readOnlyStyle,
        ariaRequired: dynamic(false),
        a11yConfig: {
            a11yStatusMessage: {
                a11ySelectedValue: props.a11ySelectedValue,
                a11yOptionsAvailable: props.a11yOptionsAvailable,
                a11yInstructions: props.a11yInstructions
            }
        }
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const selector: SingleSelector = useMemo(() => {
        if (props.source === "static") {
            return new StaticPreviewSelector(props);
        }
        if (props.source === "database") {
            return new DatabasePreviewSelector(props);
        }
        return new AssociationPreviewSelector(props);
    }, [props]);

    return (
        <div className="widget-selection-controls widget-selection-controls-editor-preview">
            <RadioSelection selector={selector} {...commonProps} />
        </div>
    );
};
