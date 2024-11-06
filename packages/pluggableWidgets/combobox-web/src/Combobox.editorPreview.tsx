import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ReactElement, createElement, useMemo } from "react";
import { ComboboxPreviewProps } from "../typings/ComboboxProps";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";

import { SingleSelector, SelectionBaseProps } from "./helpers/types";
import "./ui/Combobox.scss";
import { AssociationPreviewSelector } from "./helpers/Association/Preview/AssociationPreviewSelector";
import { StaticPreviewSelector } from "./helpers/Static/Preview/StaticPreviewSelector";
import { DatabasePreviewSelector } from "./helpers/Database/Preview/DatabasePreviewSelector";

export const preview = (props: ComboboxPreviewProps): ReactElement => {
    const id = generateUUID().toString();
    const commonProps: Omit<SelectionBaseProps<null>, "selector"> = {
        tabIndex: 1,
        inputId: id,
        labelId: `${id}-label`,
        readOnlyStyle: props.readOnlyStyle,
        ariaRequired: true,
        a11yConfig: {
            ariaLabels: {
                clearSelection: props.clearButtonAriaLabel,
                removeSelection: props.removeValueAriaLabel,
                selectAll: props.selectAllButtonCaption
            },
            a11yStatusMessage: {
                a11ySelectedValue: props.a11ySelectedValue,
                a11yOptionsAvailable: props.a11yOptionsAvailable,
                a11yInstructions: props.a11yInstructions,
                a11yNoOption: props.noOptionsText
            }
        },
        menuFooterContent: props.showFooter ? (
            <props.menuFooterContent.renderer caption="Place footer widget here">
                <div />
            </props.menuFooterContent.renderer>
        ) : null,
        keepMenuOpen:
            props.showFooter ||
            (props.optionsSourceStaticDataSource.length > 0 && props.staticDataSourceCustomContentType !== "no")
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
        <div className="widget-combobox widget-combobox-editor-preview">
            <SingleSelection selector={selector} {...commonProps} />
        </div>
    );
};
