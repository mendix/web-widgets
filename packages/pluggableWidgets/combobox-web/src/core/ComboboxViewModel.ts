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
     * What the View places for this option. Until migration step 4 the captions provider renders it
     * (plain caption markup or the custom content configured in Studio Pro), so the editor preview
     * keeps its design-mode overrides. Step 4 moves the markup into the View and leaves only the
     * custom content here.
     */
    content: ReactNode;
    selected: boolean;
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
 * The combobox ViewModel, migration step 2 shape. Open state, input value and highlighted index
 * are still owned by downshift and arrive in step 3 together with the Behavior hook.
 * See docs/design/headless-combobox.md, section 3.
 */
export interface ComboboxViewModel extends WidgetViewModel<ComboboxHints, ComboboxTexts> {
    mode: "single" | "multi";

    // state
    options: readonly ComboboxOptionVM[];
    value: string | readonly string[] | null;
    /** Single mode: the selected option, with its content rendered for the input area. */
    selected: ComboboxOptionVM | null;
    /** Multi mode: the selected options in the configured order, content rendered for a chip. */
    chips: readonly ComboboxOptionVM[];
    /**
     * What the input area shows when it is not being typed in: the selected caption or custom
     * content in single mode, the joined captions or an empty string in multi mode, the empty
     * option text when nothing is selected.
     */
    selectedContent: ReactNode;
    clearable: boolean;
    filterable: boolean;
    /** Multi mode: the select-all control is configured. */
    canSelectAll: boolean;
    /** Multi mode: state of the select-all control. */
    allSelected: "all" | "some" | "none";
    loading: ComboboxLoading;
    slots: { menuFooter?: ReactNode };

    // commands, referentially stable
    select(id: string): void;
    deselect(id: string): void;
    toggleItem(id: string): void;
    clear(): void;
    selectAll(): void;
    setInputValue(text: string): void;
    loadMore(): void;
}
