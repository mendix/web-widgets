import { DynamicValue, ValueStatus } from "mendix";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ComboboxConfig } from "./Combobox.config";
import { ComboboxContainer } from "./Combobox.container";
import { ComboboxGateProps } from "./ComboboxGate";
import { CB_TOKENS as CB } from "./tokens";
import { ComboboxPreviewProps } from "../../typings/ComboboxProps";
import { AssociationPreviewSelector } from "../helpers/Association/Preview/AssociationPreviewSelector";
import { DatabasePreviewSelector } from "../helpers/Database/Preview/DatabasePreviewSelector";
import { StaticPreviewSelector } from "../helpers/Static/Preview/StaticPreviewSelector";

function available(value: string): DynamicValue<string> {
    return { status: ValueStatus.Available, value };
}

function previewConfig(props: ComboboxPreviewProps): ComboboxConfig {
    const family = props.source === "context" ? "association" : props.source;
    const customContentType =
        family === "static"
            ? props.staticDataSourceCustomContentType
            : family === "database"
              ? props.optionsSourceDatabaseCustomContentType
              : props.optionsSourceAssociationCustomContentType;
    return Object.freeze({
        id: generateUUID().toString(),
        tabIndex: 1,
        family,
        mode: "single",
        filterType: props.filterType,
        filterInputDebounceInterval: 0,
        lazyLoading: false,
        loadingType: props.loadingType,
        // The design-mode dropzone for "options only" content is rendered everywhere.
        customContentType: customContentType === "listItem" ? "yes" : customContentType,
        readOnlyStyle: props.readOnlyStyle,
        selectedItemsStyle: "text",
        selectionMethod: "checkbox",
        selectAllButton: false,
        showFooter: props.showFooter
    });
}

function previewGateProps(props: ComboboxPreviewProps): ComboboxGateProps {
    return {
        ariaRequired: { status: ValueStatus.Available, value: false },
        ariaLabel: undefined,
        noOptionsText: available(props.noOptionsText),
        clearButtonAriaLabel: available(props.clearButtonAriaLabel),
        removeValueAriaLabel: available(props.removeValueAriaLabel),
        selectAllButtonCaption: available(props.selectAllButtonCaption),
        a11ySelectedValue: available(props.a11ySelectedValue),
        a11yOptionsAvailable: available(props.a11yOptionsAvailable),
        a11yInstructions: available(props.a11yInstructions),
        menuFooterContent: (
            <props.menuFooterContent.renderer caption="Place footer widget here">
                <div />
            </props.menuFooterContent.renderer>
        ),
        onChangeFilterInputEvent: undefined
    };
}

/**
 * The composition root of the editor preview: the same core over the preview selectors, which
 * take the preview props once and never update.
 */
export function createPreviewContainer(props: ComboboxPreviewProps): ComboboxContainer {
    const container = new ComboboxContainer();
    const config = previewConfig(props);
    container.bind(CB.config).toConstant(config);
    container.bind(CB.gate).toConstant(new GateProvider(previewGateProps(props)).gate);
    container
        .bind(CB.selector)
        .toConstant(
            config.family === "static"
                ? new StaticPreviewSelector(props)
                : config.family === "database"
                  ? new DatabasePreviewSelector(props)
                  : new AssociationPreviewSelector(props)
        );
    return container;
}
