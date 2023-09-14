import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ReferenceValue } from "mendix";
import { createElement, ReactElement, ReactNode, useMemo } from "react";
import { ComboboxPreviewProps } from "../typings/ComboboxProps";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
import { AssociationSimpleCaptionsProvider } from "./helpers/Association/AssociationSimpleCaptionsProvider";
import { BaseAssociationSelector } from "./helpers/Association/BaseAssociationSelector";
import { SingleSelector } from "./helpers/types";
import { getDatasourcePlaceholderText } from "./helpers/utils";
import "./ui/Combobox.scss";

class AssociationPreviewCaptionsProvider extends AssociationSimpleCaptionsProvider {
    emptyCaption = "Combo box";
    get(value: string | null): string {
        return value || this.emptyCaption;
    }
    render(value: string | null): ReactNode {
        return <span className="widget-combobox-caption">{this.get(value)}</span>;
    }
}
class AssociationPreviewSelector extends BaseAssociationSelector<string, ReferenceValue> implements SingleSelector {
    type = "single" as const;
    constructor(props: ComboboxPreviewProps) {
        super();
        this.caption = new AssociationPreviewCaptionsProvider(new Map());
        this.readOnly = props.readOnly;
        this.clearable = props.clearable;
        this.currentValue = getDatasourcePlaceholderText(props);
    }
}

export const preview = (props: ComboboxPreviewProps): ReactElement => {
    const id = generateUUID().toString();
    const commonProps = {
        tabIndex: 1,
        inputId: id,
        labelId: `${id}-label`
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const selector: SingleSelector = useMemo(() => {
        return new AssociationPreviewSelector(props);
    }, [props]);

    return (
        <div className="widget-combobox widget-combobox-editor-preview">
            <SingleSelection selector={selector} {...commonProps} />
        </div>
    );
};
