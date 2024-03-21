import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ReferenceValue } from "mendix";
import { ComponentType, ReactElement, ReactNode, createElement, useMemo } from "react";
import {
    ComboboxContainerProps,
    ComboboxPreviewProps,
    FilterTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum,
    OptionsSourceStaticDataSourcePreviewType,
    StaticDataSourceCustomContentTypeEnum
} from "../typings/ComboboxProps";
import { StaticPreviewCaptionsProvider } from "./helpers/Static/StaticPreviewCaptionsProvider";
import { SingleSelection } from "./components/SingleSelection/SingleSelection";
import { AssociationOptionsProvider } from "./helpers/Association/AssociationOptionsProvider";
import { AssociationSimpleCaptionsProvider } from "./helpers/Association/AssociationSimpleCaptionsProvider";
import { BaseAssociationSelector } from "./helpers/Association/BaseAssociationSelector";
import { CaptionPlacement, SingleSelector, CaptionsProvider, OptionsProvider, Status } from "./helpers/types";
import { CaptionContent, getDatasourcePlaceholderText } from "./helpers/utils";
import "./ui/Combobox.scss";

interface PreviewProps {
    customContentRenderer:
        | ComponentType<{ children: ReactNode; caption?: string }>
        | Array<ComponentType<{ children: ReactNode; caption?: string }>>;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
}

class AssociationPreviewOptionsProvider extends AssociationOptionsProvider {
    getAll(): string[] {
        return ["..."];
    }
}
class StaticPreviewOptionsProvider implements OptionsProvider<string, OptionsSourceStaticDataSourcePreviewType> {
    status: Status = "available";
    filterType: FilterTypeEnum = "contains";
    searchTerm: string = "";
    hasMore?: boolean | undefined = undefined;
    constructor(private optionsMap: Map<string, OptionsSourceStaticDataSourcePreviewType>) {}
    setSearchTerm(_value: string): void {}
    onAfterSearchTermChange(_callback: () => void): void {}
    loadMore?(): void {
        throw new Error("Method not implemented.");
    }
    _updateProps(_: OptionsSourceStaticDataSourcePreviewType): void {
        throw new Error("Method not implemented.");
    }
    _optionToValue(_value: string | null): string | undefined {
        throw new Error("Method not implemented.");
    }
    _valueToOption(_value: string | undefined): string | null {
        throw new Error("Method not implemented.");
    }
    getAll(): string[] {
        return this.optionsMap.size ? Array.from(this.optionsMap.keys()) : ["..."];
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
        this.customContentRenderer = props.customContentRenderer as ComponentType<{
            children: ReactNode;
            caption?: string | undefined;
        }>;
        this.customContentType = props.customContentType;
    }

    render(value: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode {
        // always render custom content dropzone in design mode if type is options only
        if (placement === "options") {
            return <CaptionContent htmlFor={htmlFor}>{this.get(value)}</CaptionContent>;
        }

        return super.render(value, placement === "label" ? "options" : placement);
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
        this.currentId = getDatasourcePlaceholderText(props);
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
class StaticPreviewSelector implements SingleSelector {
    type = "single" as const;
    status: Status = "available";
    readOnly: boolean = false;
    validation?: string | undefined = undefined;
    options: StaticPreviewOptionsProvider;
    caption: CaptionsProvider;
    clearable: boolean;
    currentId: string | null;
    customContentType: StaticDataSourceCustomContentTypeEnum = "listItem";
    onEnterEvent?: Function | undefined;
    onLeaveEvent?: Function | undefined;
    constructor(props: ComboboxPreviewProps) {
        const optionsMap = new Map<string, OptionsSourceStaticDataSourcePreviewType>();
        this.caption = new StaticPreviewCaptionsProvider(
            optionsMap,
            props.staticDataSourceCustomContentType,
            getDatasourcePlaceholderText(props)
        );
        this.options = new StaticPreviewOptionsProvider(optionsMap);
        this.readOnly = props.readOnly;
        this.clearable = props.clearable;
        this.currentId = null;
        this.customContentType = props.optionsSourceAssociationCustomContentType;
        if (props.optionsSourceAssociationCustomContentType === "listItem") {
            // always render custom content dropzone in design mode if type is options only
            this.customContentType = "yes";
        }
        props.optionsSourceStaticDataSource.forEach((option, index) => {
            optionsMap.set(index.toString(), option);
        });
    }
    setValue(_: string | null): void {
        throw new Error("Method not implemented.");
    }
    updateProps(_: ComboboxContainerProps): void {
        throw new Error("Method not implemented.");
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
        menuFooterContent: props.showFooter ? (
            <props.menuFooterContent.renderer caption="Place footer widget here">
                <div />
            </props.menuFooterContent.renderer>
        ) : null,
        keepMenuOpen: props.showFooter || props.staticDataSourceCustomContentType === "listItem"
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const selector: SingleSelector = useMemo(() => {
        if (props.source === "static") {
            return new StaticPreviewSelector(props);
        }
        return new AssociationPreviewSelector(props);
    }, [props]);
    return (
        <div className="widget-combobox widget-combobox-editor-preview">
            <SingleSelection selector={selector} {...commonProps} />
        </div>
    );
};
