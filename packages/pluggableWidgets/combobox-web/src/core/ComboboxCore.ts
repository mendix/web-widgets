import { action, computed, makeObservable } from "mobx";
import { ReactNode } from "react";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
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
import { Translate, WidgetA11y, WidgetStatus } from "./WidgetViewModel";
import { MultiSelector, Selector, SingleSelector, Status } from "../helpers/types";

type Envelope = Pick<
    ComboboxViewModel,
    "id" | "status" | "readOnly" | "validation" | "a11y" | "tabIndex" | "className" | "style"
>;
type Selection = Pick<ComboboxViewModel, "value" | "selected" | "chips" | "selectedContent" | "allSelected">;
type Flags = Pick<ComboboxViewModel, "mode" | "clearable" | "filterable" | "canSelectAll">;
type Commands = Pick<
    ComboboxViewModel,
    "select" | "deselect" | "toggleItem" | "clear" | "selectAll" | "setInputValue" | "loadMore"
>;
/** The raw text per key. `emptyOption` comes from the captions provider, which already handles its status. */
type TextValues = Record<Exclude<keyof ComboboxTexts, "emptyOption">, string>;

function shallowEqual<T extends object>(a: T, b: T): boolean {
    const keys = Object.keys(a) as Array<keyof T>;
    return keys.length === Object.keys(b).length && keys.every(key => Object.is(a[key], b[key]));
}

/** Returns `prev` when `next` has the same own values, so an unchanged slice keeps its reference. */
function reuse<T extends object>(prev: T | undefined, next: T): T {
    return prev !== undefined && shallowEqual(prev, next) ? prev : next;
}

function sameItems<T>(prev: readonly T[] | undefined, next: readonly T[]): readonly T[] {
    return prev && prev.length === next.length && prev.every((item, i) => item === next[i]) ? prev : next;
}

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
 * The combobox Core: derives the ViewModel from the selector store, the static config and the
 * props gate as a tree of cached slices. Each slice keeps its reference while its values are
 * unchanged, so a View can memoise on them. MobX never leaves this class; the View reads
 * `viewModel` through a snapshot hook. See docs/design/headless-widgets.md, section 6.
 */
export class ComboboxCore<S extends Selector = Selector> {
    private readonly optionCache = new Map<string, ComboboxOptionVM>();
    private prevTexts?: TextValues;
    private prevEnvelope?: Envelope;
    private prevA11y?: WidgetA11y;
    private prevOptions?: readonly ComboboxOptionVM[];
    private prevChips?: readonly ComboboxOptionVM[];
    private prevSelection?: Selection;
    private prevFlags?: Flags;
    private prevLoading?: ComboboxLoading;
    readonly hints: ComboboxHints;
    readonly commands: Commands;
    readonly t: Translate<ComboboxTexts>;

    constructor(
        /** The selector seam. The downshift hooks still read it directly until migration step 3. */
        public readonly selector: S,
        private readonly config: ComboboxConfig,
        private readonly gate: DerivedPropsGate<ComboboxGateProps>,
        private readonly filterInputEvent: FilterInputEventService
    ) {
        this.hints = hints(config);
        this.commands = {
            select: this.select.bind(this),
            deselect: this.deselect.bind(this),
            toggleItem: this.toggleItem.bind(this),
            clear: this.clear.bind(this),
            selectAll: this.selectAll.bind(this),
            setInputValue: this.setInputValue.bind(this),
            loadMore: this.loadMore.bind(this)
        };
        this.t = (key, ...params) => this.translate(key, ...params);
        makeObservable<this, "texts" | "envelope" | "options" | "selection" | "flags" | "loading">(this, {
            texts: computed,
            envelope: computed,
            options: computed,
            selection: computed,
            flags: computed,
            loading: computed,
            viewModel: computed({ keepAlive: true }),
            select: action,
            deselect: action,
            toggleItem: action,
            clear: action,
            selectAll: action,
            setInputValue: action,
            loadMore: action
        });
    }

    private get multi(): MultiSelector | null {
        return this.selector.type === "multi" ? this.selector : null;
    }

    private get texts(): TextValues {
        const props = this.gate.props;
        return (this.prevTexts = reuse(this.prevTexts, {
            noOptions: props.noOptionsText?.value ?? "",
            clearSelection: props.clearButtonAriaLabel?.value ?? "",
            removeSelection: props.removeValueAriaLabel?.value ?? "",
            selectAll: props.selectAllButtonCaption?.value ?? "",
            a11ySelectedValue: props.a11ySelectedValue?.value ?? "",
            a11yOptionsAvailable: props.a11yOptionsAvailable?.value ?? "",
            a11yInstructions: props.a11yInstructions?.value ?? "",
            a11yNoOption: props.noOptionsText?.value ?? ""
        }));
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
        const a11y = (this.prevA11y = reuse(this.prevA11y, {
            label: props.ariaLabel?.value,
            required: props.ariaRequired.value ?? false,
            describedBy: selector.validation ? `${config.id}-validation-message` : undefined
        }));
        return (this.prevEnvelope = reuse(this.prevEnvelope, {
            id: config.id,
            status: toWidgetStatus(selector.status),
            readOnly: selector.readOnly,
            validation: selector.validation,
            a11y,
            tabIndex: config.tabIndex
        }));
    }

    private option(id: string, selected: boolean, content: ReactNode): ComboboxOptionVM {
        const next = { id, caption: this.selector.caption.get(id), content, selected };
        const vm = reuse(this.optionCache.get(id), next);
        this.optionCache.set(id, vm);
        return vm;
    }

    private get options(): readonly ComboboxOptionVM[] {
        const { selector, multi, config } = this;
        const ids = multi ? multi.getOptions() : selector.options.getAll();
        const next = ids.map(id =>
            this.option(
                id,
                multi ? (multi.currentId?.includes(id) ?? false) : selector.currentId === id,
                selector.caption.render(id, "options", multi ? `${config.id}_${id}` : undefined)
            )
        );
        return (this.prevOptions = sameItems(this.prevOptions, next));
    }

    private get selection(): Selection {
        const { selector, multi } = this;
        let next: Selection;
        if (multi) {
            const ids = multi.currentId ?? [];
            const chips = ids.map(id => this.option(id, true, selector.caption.render(id, "label")));
            this.prevChips = sameItems(this.prevChips, chips);
            next = {
                value: multi.currentId,
                selected: null,
                chips: this.prevChips,
                selectedContent: this.selectedCaptions(ids),
                allSelected: multi.isOptionsSelected()
            };
        } else {
            const single = selector as SingleSelector;
            const content = selector.caption.render(single.currentId, "label");
            next = {
                value: single.currentId,
                selected: single.currentId === null ? null : this.option(single.currentId, true, content),
                chips: [],
                selectedContent: content,
                allSelected: "none"
            };
        }
        return (this.prevSelection = reuse(this.prevSelection, next));
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
        return (this.prevFlags = reuse(this.prevFlags, {
            mode: config.mode,
            clearable: selector.clearable,
            filterable: config.filterType !== "none",
            canSelectAll: config.selectAllButton
        }));
    }

    private get loading(): ComboboxLoading {
        const { options } = this.selector;
        return (this.prevLoading = reuse(this.prevLoading, {
            lazy: this.config.lazyLoading,
            isLoading: options.isLoading,
            hasMore: options.hasMore ?? false
        }));
    }

    get viewModel(): ComboboxViewModel {
        return {
            ...this.envelope,
            ...this.flags,
            ...this.selection,
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

    /** The filter text: narrows the options and, debounced, runs the "On change filter input" action. */
    setInputValue(text: string): void {
        this.selector.options.setSearchTerm(text);
        this.filterInputEvent.notify(text);
    }

    loadMore(): void {
        this.selector.options.loadMore?.();
    }
}
