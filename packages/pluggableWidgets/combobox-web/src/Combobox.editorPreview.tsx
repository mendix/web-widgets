import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ReferenceValue } from "mendix";
import { ComponentType, ReactElement, ReactNode, createElement, useMemo } from "react";
import { ComboboxPreviewProps, OptionsSourceAssociationCustomContentTypeEnum } from "../typings/ComboboxProps";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
import {
    AssociationSimpleCaptionsProvider,
    CaptionContent
} from "./helpers/Association/AssociationSimpleCaptionsProvider";
import { AssociationOptionsProvider } from "./helpers/Association/AssociationOptionsProvider";
import { BaseAssociationSelector } from "./helpers/Association/BaseAssociationSelector";
import { CaptionPlacement, SingleSelector } from "./helpers/types";
import { getDatasourcePlaceholderText } from "./helpers/utils";
import "./ui/Combobox.scss";

interface PreviewProps {
    customContentRenderer: ComponentType<{ children: ReactNode; caption?: string }>;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
}

class AssociationPreviewOptionsProvider extends AssociationOptionsProvider {
    getAll(): string[] {
        return ["..."];
    }
}

class AssociationPreviewCaptionsProvider extends AssociationSimpleCaptionsProvider {
    emptyCaption = "Combo box";
    private customContentRenderer: ComponentType<{ children: ReactNode; caption?: string }> = () => <div></div>;
    get(value: string | null): string {
        return value || this.emptyCaption;
    }

    getCustomContent(value: string | null): ReactNode | null {
        if (value === null) {
            return null;
        }
        if (this.customContentType !== "no") {
            return (
                <this.customContentRenderer caption={"CUSTOM CONTENT"}>
                    <div />
                </this.customContentRenderer>
            );
        }
    }

    updatePreviewProps(props: PreviewProps): void {
        this.customContentRenderer = props.customContentRenderer;
        this.customContentType = props.customContentType;
    }

    render(value: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode {
        // always render custom content dropzone in design mode if type is options only
        if (placement === "options") {
            return <CaptionContent htmlFor={htmlFor}>{this.get(value)}</CaptionContent>;
        }

        return super.render(value, placement === "label" ? "options" : placement);
        // return super.render(value, placement);
    }
}
class AssociationPreviewSelector extends BaseAssociationSelector<string, ReferenceValue> implements SingleSelector {
    type = "single" as const;

    constructor(props: ComboboxPreviewProps) {
        super();
        this.caption = new AssociationPreviewCaptionsProvider(new Map());
        this.options = new AssociationPreviewOptionsProvider(this.caption, new Map());
        this.readOnly = props.readOnly;
        this.clearable = props.clearable;
        this.currentValue = getDatasourcePlaceholderText(props);
        this.customContentType = props.optionsSourceAssociationCustomContentType;
        (this.caption as AssociationPreviewCaptionsProvider).updatePreviewProps({
            customContentRenderer: props.optionsSourceAssociationCustomContent.renderer,
            customContentType: props.optionsSourceAssociationCustomContentType
        });

        if (props.optionsSourceAssociationCustomContentType === "listItem") {
            // always render custom content dropzone in design mode if type is options only
            this.customContentType = "yes";
        }
    }
}

export const preview = (props: ComboboxPreviewProps): ReactElement => {
    const id = generateUUID().toString();
    const commonProps = {
        tabIndex: 1,
        inputId: id,
        labelId: `${id}-label`,
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
        showFooter: props.showFooter,
        menuFooterContent: (
            <props.menuFooterContent.renderer caption="Place footer widget here">
                <div />
            </props.menuFooterContent.renderer>
        ),
        keepMenuOpen: props.showFooter
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
