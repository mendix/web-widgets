import {
    ComboboxContainerProps,
    CustomEditabilityEnum,
    FilterTypeEnum,
    LoadingTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum,
    ReadOnlyStyleEnum,
    SelectedItemsSortingEnum,
    SelectedItemsStyleEnum,
    SelectionMethodEnum
} from "../../typings/ComboboxProps";
import { SelectionType } from "../helpers/types";

export type SelectorFamily = "enumeration" | "association" | "database" | "static";

/**
 * Static configuration of one widget instance. Simple-type Studio Pro properties never change
 * between renders (docs/requirements/backend-structure.md), so they are read once here and
 * handed to the container as a frozen constant instead of being pushed through the gate.
 */
export interface ComboboxConfig {
    id: string;
    tabIndex?: number;
    family: SelectorFamily;
    mode: SelectionType;
    filterType: FilterTypeEnum;
    filterInputDebounceInterval: number;
    clearable: boolean;
    /** Association and database: captions from an attribute (the datasource can filter on it) or from an expression. */
    captionType: "attribute" | "expression";
    /** Database: the editability rule next to the bound attribute's own read-only flag. */
    customEditability: CustomEditabilityEnum;
    /** Already resolved: an expression caption turns lazy loading off. */
    lazyLoading: boolean;
    loadingType: LoadingTypeEnum;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
    readOnlyStyle: ReadOnlyStyleEnum;
    /** Already resolved: forced to `boxes` by row-click selection or custom content everywhere. */
    selectedItemsStyle: SelectedItemsStyleEnum;
    selectionMethod: SelectionMethodEnum;
    selectAllButton: boolean;
    selectedItemsSorting: SelectedItemsSortingEnum;
    showFooter: boolean;
}

export function comboboxConfig(props: ComboboxContainerProps): ComboboxConfig {
    const [family, mode] = selectorFamily(props);
    const customContentType = customContent(props, family);
    const multi = mode === "multi";
    const forcedBoxes = props.selectionMethod === "rowclick" || customContentType === "yes";

    return Object.freeze({
        id: props.id,
        tabIndex: props.tabIndex,
        family,
        mode,
        filterType: props.filterType,
        filterInputDebounceInterval: props.filterInputDebounceInterval,
        clearable: props.clearable,
        captionType: captionType(props, family),
        customEditability: props.customEditability,
        lazyLoading: lazyLoading(props, family),
        loadingType: props.loadingType,
        customContentType,
        readOnlyStyle: props.readOnlyStyle,
        selectedItemsStyle: multi ? (forcedBoxes ? "boxes" : props.selectedItemsStyle) : "text",
        selectionMethod: multi ? props.selectionMethod : "checkbox",
        selectAllButton: multi && props.selectAllButton,
        selectedItemsSorting: multi ? props.selectedItemsSorting : "none",
        showFooter: props.showFooter
    });
}

function selectorFamily(props: ComboboxContainerProps): [SelectorFamily, SelectionType] {
    switch (props.source) {
        case "context":
            switch (props.optionsSourceType) {
                case "enumeration":
                case "boolean":
                    return ["enumeration", "single"];
                case "association":
                    return ["association", props.attributeAssociation.type === "Reference" ? "single" : "multi"];
                default:
                    throw new Error(`'optionsSourceType' of type '${props.optionsSourceType}' is not supported`);
            }
        case "database":
            return ["database", props.optionsSourceDatabaseItemSelection?.type === "Multi" ? "multi" : "single"];
        case "static":
            return ["static", "single"];
        default:
            throw new Error(`Source of type '${props.source}' is not supported`);
    }
}

function customContent(
    props: ComboboxContainerProps,
    family: SelectorFamily
): OptionsSourceAssociationCustomContentTypeEnum {
    switch (family) {
        case "association":
            return props.optionsSourceAssociationCustomContentType;
        case "database":
            return props.optionsSourceDatabaseCustomContentType;
        case "static":
            return props.staticDataSourceCustomContentType;
        default:
            return "no";
    }
}

/** Lazy loading needs a caption attribute to filter on; an expression caption turns it off. */
function lazyLoading(props: ComboboxContainerProps, family: SelectorFamily): boolean {
    const paged = family === "association" || family === "database";
    return paged && props.lazyLoading && captionType(props, family) !== "expression";
}

function captionType(props: ComboboxContainerProps, family: SelectorFamily): "attribute" | "expression" {
    switch (family) {
        case "association":
            return props.optionsSourceAssociationCaptionType;
        case "database":
            return props.optionsSourceDatabaseCaptionType;
        default:
            return "attribute";
    }
}
