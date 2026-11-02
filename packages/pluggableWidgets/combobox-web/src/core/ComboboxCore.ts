import { action, computed, makeObservable, observable } from "mobx";
import { ReactNode } from "react";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ComboboxConfig } from "./Combobox.config";
import { ComboboxGateProps } from "./ComboboxGate";
import {
    ComboboxHints,
    ComboboxLoading,
    ComboboxOptionVM,
    ComboboxTexts,
    ComboboxViewModel
} from "./ComboboxViewModel";
import { FilterInputEventService } from "./FilterInputEvent.service";
import { Translate, WidgetStatus } from "./WidgetViewModel";
import { MultiSelector, Selector, SingleSelector, Status } from "../helpers/types";
import { textOrFallback } from "../helpers/utils";

const DEFAULT_CLEAR_SELECTION_LABEL = "Clear selection";
const DEFAULT_REMOVE_VALUE_LABEL = "Remove value";

type Envelope = Pick<
    ComboboxViewModel,
    "id" | "status" | "readOnly" | "validation" | "a11y" | "tabIndex" | "className" | "style"
>;
type Selection = Pick<ComboboxViewModel, "value" | "selected" | "chips" | "selectedContent" | "allSelected">;
type Input = Pick<ComboboxViewModel, "inputValue" | "isOpen" | "highlightedIndex">;
type Flags = Pick<ComboboxViewModel, "mode" | "clearable" | "filterable" | "canSelectAll">;
type Commands = Pick<
    ComboboxViewModel,
    | "open"
    | "close"
    | "toggle"
    | "highlight"
    | "select"
    | "deselect"
    | "toggleItem"
    | "clear"
    | "selectAll"
    | "setInputValue"
    | "loadMore"
    | "enter"
    | "leave"
>;
/** The raw text per key. `emptyOption` comes from the captions provider, which already handles its status. */
type TextValues = Record<Exclude<keyof ComboboxTexts, "emptyOption">, string>;

function toWidgetStatus(status: Status): WidgetStatus {
    return status === "available" ? "ready" : status;
}

function hints(config: ComboboxConfig): ComboboxHints {
    const customContent = { no: "none", yes: "everywhere", listItem: "menuOnly" } as const;
    return {
        readOnlyStyle: config.readOnlyStyle,
        selectedItemsStyle: config.selectedItemsStyle,
        selectionMethod: config.selectionMethod,
        loadingType: config.loadingType,
        customContent: customContent[config.customContentType]
    };
}

/**
 * The combobox Core: owns the UI state (open flag, highlighted index; the input text is the
 * selector's search term) and derives the ViewModel from the selector store, the static config
 * and the props gate. MobX never leaves this class; the View reads `viewModel` through a snapshot hook.
 */
export class ComboboxCore<S extends Selector = Selector> {
    isOpen = false;
    highlightedIndex = -1;
    readonly hints: ComboboxHints;
    readonly commands: Commands;
    readonly t: Translate<ComboboxTexts>;

    constructor(
        /** The selector seam: the model the Core derives from. */
        public readonly selector: S,
        private readonly config: ComboboxConfig,
        private readonly gate: DerivedPropsGate<ComboboxGateProps>,
        private readonly filterInputEvent: FilterInputEventService
    ) {
        this.hints = hints(config);
        this.t = (key, ...params) => this.translate(key, ...params);
        makeObservable<this, "texts" | "envelope" | "input" | "options" | "selection" | "flags" | "loading">(this, {
            isOpen: observable,
            highlightedIndex: observable,
            texts: computed,
            envelope: computed,
            input: computed,
            options: computed,
            selection: computed,
            flags: computed,
            loading: computed,
            viewModel: computed({ keepAlive: true }),
            open: action,
            close: action,
            toggle: action,
            highlight: action,
            select: action,
            deselect: action,
            toggleItem: action,
            clear: action,
            selectAll: action,
            setInputValue: action,
            loadMore: action,
            enter: action,
            leave: action
        });
        // Bound after makeObservable, so that the bound functions are the action wrappers.
        this.commands = {
            open: this.open.bind(this),
            close: this.close.bind(this),
            toggle: this.toggle.bind(this),
            highlight: this.highlight.bind(this),
            select: this.select.bind(this),
            deselect: this.deselect.bind(this),
            toggleItem: this.toggleItem.bind(this),
            clear: this.clear.bind(this),
            selectAll: this.selectAll.bind(this),
            setInputValue: this.setInputValue.bind(this),
            loadMore: this.loadMore.bind(this),
            enter: this.enter.bind(this),
            leave: this.leave.bind(this)
        };
    }

    get inputValue(): string {
        return this.selector.options.searchTerm;
    }

    private get multi(): MultiSelector | null {
        return this.selector.type === "multi" ? this.selector : null;
    }

    private get texts(): TextValues {
        const props = this.gate.props;
        return {
            noOptions: props.noOptionsText?.value ?? "",
            clearSelection: textOrFallback(props.clearButtonAriaLabel?.value, DEFAULT_CLEAR_SELECTION_LABEL),
            removeSelection: textOrFallback(props.removeValueAriaLabel?.value, DEFAULT_REMOVE_VALUE_LABEL),
            selectAll: props.selectAllButtonCaption?.value ?? "",
            a11ySelectedValue: props.a11ySelectedValue?.value ?? "",
            a11yOptionsAvailable: props.a11yOptionsAvailable?.value ?? "",
            a11yInstructions: props.a11yInstructions?.value ?? "",
            a11yNoOption: textOrFallback(props.noOptionsText?.value, props.a11yNoOptions?.value ?? "")
        };
    }

    private translate<K extends keyof ComboboxTexts>(key: K, ...params: ComboboxTexts[K]): string {
        switch (key) {
            case "emptyOption":
                return this.selector.caption.emptyCaption;
            case "a11ySelectedValue":
            case "a11yOptionsAvailable":
                return `${this.texts[key as "a11ySelectedValue" | "a11yOptionsAvailable"]} ${params[0]}`;
            default:
                return this.texts[key as keyof TextValues];
        }
    }

    private get envelope(): Envelope {
        const { selector, config } = this;
        const props = this.gate.props;
        const a11y = {
            label: props.ariaLabel?.value,
            required: props.ariaRequired.value ?? false,
            describedBy: selector.validation ? `${config.id}-validation-message` : undefined
        };
        return {
            id: config.id,
            status: toWidgetStatus(selector.status),
            readOnly: selector.readOnly,
            validation: selector.validation,
            a11y,
            tabIndex: config.tabIndex
        };
    }

    private get input(): Input {
        return {
            inputValue: this.inputValue,
            isOpen: this.isOpen,
            highlightedIndex: this.highlightedIndex
        };
    }

    private option(id: string, selected: boolean, highlighted: boolean, content: ReactNode): ComboboxOptionVM {
        return { id, caption: this.selector.caption.get(id), content, selected, highlighted };
    }

    private get options(): readonly ComboboxOptionVM[] {
        const { selector, multi, config } = this;
        const ids = multi ? multi.getOptions() : selector.options.getAll();
        return ids.map((id, index) =>
            this.option(
                id,
                multi ? (multi.currentId?.includes(id) ?? false) : selector.currentId === id,
                index === this.highlightedIndex,
                selector.caption.render(id, "options", multi ? `${config.id}_${id}` : undefined)
            )
        );
    }

    private get selection(): Selection {
        const { selector, multi } = this;
        let next: Selection;
        if (multi) {
            const ids = multi.currentId ?? [];
            const chips = ids.map(id => this.option(id, true, false, selector.caption.render(id, "label")));
            next = {
                value: multi.currentId,
                selected: null,
                chips,
                selectedContent: this.selectedCaptions(ids),
                allSelected: multi.isOptionsSelected()
            };
        } else {
            const single = selector as SingleSelector;
            const content = selector.caption.render(single.currentId, "label");
            next = {
                value: single.currentId,
                selected: single.currentId === null ? null : this.option(single.currentId, true, false, content),
                chips: [],
                selectedContent: content,
                allSelected: "none"
            };
        }
        return next;
    }

    /** What the input area shows for a multi selection: the empty caption, nothing (boxes), or the joined captions. */
    private selectedCaptions(ids: string[]): string {
        const { caption } = this.selector;
        if (ids.length === 0) {
            return caption.emptyCaption;
        }
        return this.config.selectedItemsStyle === "text" ? ids.map(id => caption.get(id)).join(", ") : "";
    }

    private get flags(): Flags {
        const { selector, config } = this;
        return {
            mode: config.mode,
            clearable: selector.clearable,
            filterable: config.filterType !== "none",
            canSelectAll: config.selectAllButton
        };
    }

    private get loading(): ComboboxLoading {
        const { options } = this.selector;
        return {
            lazy: this.config.lazyLoading,
            isLoading: options.isLoading,
            hasMore: options.hasMore
        };
    }

    get viewModel(): ComboboxViewModel {
        return {
            ...this.envelope,
            ...this.flags,
            ...this.selection,
            ...this.input,
            ...this.commands,
            hints: this.hints,
            options: this.options,
            loading: this.loading,
            slots: { menuFooter: this.config.showFooter ? this.gate.props.menuFooterContent : undefined },
            t: this.t
        };
    }

    // Commands. Selection writes go through the selector, which writes to the Mendix value; the
    // new value then arrives through props like any other Mendix change.

    open(): void {
        this.isOpen = true;
        this.selector.options.requestFirstPage();
    }

    /** Closing a single-select menu drops the filter text, so the input shows the selection again. A multi-select keeps it. */
    close(): void {
        this.isOpen = false;
        if (this.config.mode === "single") {
            this.setInputValue("", "reset");
        }
    }

    toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    highlight(index: number): void {
        this.highlightedIndex = index;
    }

    select(id: string): void {
        const { multi } = this;
        if (multi) {
            const current = multi.currentId ?? [];
            if (!current.includes(id)) {
                multi.setValue([...current, id]);
            }
        } else {
            (this.selector as SingleSelector).setValue(id);
        }
    }

    deselect(id: string): void {
        const { multi } = this;
        if (multi) {
            const current = multi.currentId ?? [];
            if (current.includes(id)) {
                multi.setValue(current.filter(item => item !== id));
            }
        } else if (this.selector.currentId === id) {
            (this.selector as SingleSelector).setValue(null);
        }
    }

    toggleItem(id: string): void {
        const selected = this.multi ? (this.multi.currentId?.includes(id) ?? false) : this.selector.currentId === id;
        if (selected) {
            this.deselect(id);
        } else {
            this.select(id);
        }
    }

    clear(): void {
        if (this.multi) {
            this.multi.setValue([]);
        } else {
            (this.selector as SingleSelector).setValue(null);
        }
    }

    selectAll(): void {
        this.multi?.setValue(this.selector.options.getAll());
    }

    /** The filter text narrows the options; typed text also runs the "On change filter input" action, debounced. */
    setInputValue(text: string, reason: "input" | "reset" = "input"): void {
        this.selector.options.setSearchTerm(text);
        if (reason === "input") {
            this.filterInputEvent.notify(text);
        }
    }

    loadMore(): void {
        this.selector.options.loadMore();
    }

    enter(): void {
        executeAction(this.gate.props.onEnterEvent);
    }

    leave(): void {
        executeAction(this.gate.props.onLeaveEvent);
        this.close();
    }
}
