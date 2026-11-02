import { ReactNode } from "react";
import { WidgetViewModel } from "./WidgetViewModel";
import {
    LoadingTypeEnum,
    ReadOnlyStyleEnum,
    SelectedItemsStyleEnum,
    SelectionMethodEnum
} from "../../typings/ComboboxProps";

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
    emptyOption: [];
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
 * The combobox ViewModel. All state lives in the Core, including the open flag, the input text
 * and the highlighted index; a behaviour library such as downshift runs in controlled mode
 * against it. See docs/design/headless-combobox.md, section 3.
 */
export interface ComboboxViewModel extends WidgetViewModel<ComboboxHints, ComboboxTexts> {
    mode: "single" | "multi";

    // state
    options: readonly ComboboxOptionVM[];
    value: string | readonly string[] | null;
    /** Single mode: the selected option. */
    selected: ComboboxOptionVM | null;
    /** Multi mode: the selected options in the configured order. */
    chips: readonly ComboboxOptionVM[];
    /**
     * The text the input area shows when nothing is typed: the selected caption in single mode,
     * the joined captions or an empty string in multi mode, the empty option text when nothing is
     * selected. A database selector shows its attribute's display value when the value matches no
     * option, which is why this is not derived from `selected` and `t("emptyOption")` by the View.
     */
    selectedCaption: string;
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
    /** The widget received focus from outside: runs the "On enter" action. */
    enter(): void;
    /** Focus left the widget: runs the "On leave" action and closes the menu. */
    leave(): void;
}
