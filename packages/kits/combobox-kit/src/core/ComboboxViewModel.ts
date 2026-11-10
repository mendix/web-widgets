import { ReactNode } from "react";
import { InputViewModel, WidgetViewModel } from "@mendix/widget-kit/WidgetViewModel";
import {
    LoadingTypeEnum,
    ReadOnlyStyleEnum,
    SelectedItemsStyleEnum,
    SelectionMethodEnum
} from "../typings/ComboboxProps";

export interface ComboboxOptionVM {
    id: string;
    /** Always present: the caption attribute, expression or static caption. */
    caption: string;
    /**
     * The custom content configured in Studio Pro, present whenever a custom-content widget is
     * configured, regardless of placement. Where it is shown is the View's decision, guided by
     * `hints.customContent`; the Atlas View shows it in the menu for `everywhere` and `menuOnly`,
     * and in the input area and the chips for `everywhere` only.
     */
    content?: ReactNode;
    selected: boolean;
    highlighted: boolean;
}

export interface ComboboxHints {
    readOnlyStyle: ReadOnlyStyleEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
    selectionMethod: SelectionMethodEnum;
    loadingType: LoadingTypeEnum;
    /** Studio Pro "no" | "yes" | "listItem". */
    customContent: "none" | "everywhere" | "menuOnly";
}

export type ComboboxTexts = {
    noOptions: [];
    clearSelection: [];
    removeSelection: [];
    selectAll: [];
    a11ySelectedValue: [caption: string];
    a11yOptionsAvailable: [count: number];
    a11yInstructions: [];
    a11yNoOption: [];
};

export interface ComboboxLoading {
    /** The datasource is paged and the menu loads more on scroll. */
    lazy: boolean;
    isLoading: boolean;
    hasMore: boolean;
}

/**
 * The combobox ViewModel: the envelope, the input facet and the combobox body. All state lives in
 * the Core, including the open flag, the input text and the highlighted index; a behaviour
 * library such as downshift runs in controlled mode against it.
 * See docs/design/headless-combobox.md, section 3.
 */
export interface ComboboxViewModel extends WidgetViewModel<ComboboxHints, ComboboxTexts>, InputViewModel {
    mode: "single" | "multi";

    // state
    options: readonly ComboboxOptionVM[];
    value: string | readonly string[] | null;
    /** Single mode: the selected option. */
    selected: ComboboxOptionVM | null;
    /** Multi mode: the selected options in the configured order. */
    chips: readonly ComboboxOptionVM[];
    /**
     * The caption of the selection, for the input area while nothing is typed: the selected
     * option's caption in single mode, the joined captions in multi mode with the "text" style,
     * an empty string in the "boxes" style and whenever nothing is selected.
     */
    selectedCaption: string;
    /**
     * What the input area shows while nothing is selected: the "Empty option text" property, or
     * for a database combobox the attribute's display value while it matches no option. Not
     * derived from the texts by the View, so that the display-value rule stays in the Core.
     */
    placeholder: string;
    /** The filter text typed in the input. Empty while nothing is typed. */
    inputValue: string;
    isOpen: boolean;
    /** Index into `options` of the highlighted option, or -1. */
    highlightedIndex: number;
    clearable: boolean;
    filterable: boolean;
    /** Multi mode: the select-all control is configured. */
    canSelectAll: boolean;
    /** Multi mode: state of the select-all control. */
    allSelected: "all" | "some" | "none";
    loading: ComboboxLoading;
    slots: { menuFooter?: ReactNode };

    // commands, referentially stable
    open(): void;
    close(): void;
    toggle(): void;
    highlight(index: number): void;
    select(id: string): void;
    deselect(id: string): void;
    toggleItem(id: string): void;
    clear(): void;
    selectAll(): void;
    /**
     * Sets the filter text. `input` is the user typing and also runs the "On change filter input"
     * action; `reset` is the View clearing the text after a selection or on close and runs nothing.
     */
    setInputValue(text: string, reason?: "input" | "reset"): void;
    loadMore(): void;
    /** Focus left the widget: runs the "On leave" action and closes the menu. */
    leave(): void;
}
