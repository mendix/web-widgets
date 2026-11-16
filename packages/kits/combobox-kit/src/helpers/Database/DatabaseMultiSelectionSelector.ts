import { ObjectItem, SelectionMultiValue } from "mendix";
import { action, autorun, computed, makeObservable } from "mobx";
import { ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ComboboxConfig } from "../../core/Combobox.config";
import { menuOptions, selectAllState } from "../multiSelection";
import { MultiSelector, Status } from "../types";
import { sortSelectedItems } from "../utils";
import { BaseDatabaseSelector, DatabaseGateProps } from "./BaseDatabaseSelector";

export class DatabaseMultiSelectionSelector extends BaseDatabaseSelector implements MultiSelector, SetupComponent {
    readonly type = "multi";

    constructor(host: SetupComponentHost, gate: DerivedPropsGate<DatabaseGateProps>, config: ComboboxConfig) {
        super(host, gate, config);
        makeObservable<this, "available">(this, {
            available: computed,
            status: computed,
            clearable: computed,
            currentId: computed,
            setValue: action
        });
        host.add(this);
    }

    private get selectionValue(): SelectionMultiValue | undefined {
        return this.selection as SelectionMultiValue | undefined;
    }

    private get available(): boolean {
        return this.ds.status !== "unavailable" && this.formatter !== undefined && this.emptyOptionAvailable;
    }

    /** A multi selection has no bound attribute to be read-only. */
    get readOnly(): boolean {
        return false;
    }

    get status(): Status {
        if (!this.available) {
            return "unavailable";
        }
        return this.ds.status === "loading" ? "loading" : "available";
    }

    get validation(): string | undefined {
        return undefined;
    }

    get clearable(): boolean {
        return this.available && this.config.clearable;
    }

    /** The selected ids in selection order, or sorted by caption when configured. */
    get currentId(): string[] | null {
        if (!this.available) {
            return null;
        }
        return sortSelectedItems(
            this.selectionValue?.selection,
            this.config.selectedItemsSorting,
            this.options.sortOrder,
            id => this.caption.get(id)
        );
    }

    /** Ids resolve through the loaded page or the current selection; an id known nowhere is dropped. */
    setValue(ids: string[] | null): void {
        const items = ids
            ?.map(id => {
                const item =
                    this.options.item(id) ?? this.selectionValue?.selection.find(selected => selected.id === id);
                if (!item) {
                    console.warn(`Error setting value: '${id}', not found in options or selection`);
                }
                return item;
            })
            .filter((item): item is ObjectItem => item !== undefined);
        if (items) {
            this.selectionValue?.setSelection(items);
        }
    }

    getOptions(): string[] {
        return menuOptions(this.options.getAll(), this.currentId, this.config.selectionMethod);
    }

    isOptionsSelected(): ThreeStateCheckBoxEnum {
        return selectAllState(this.options.getAll(), this.currentId);
    }

    setup(): () => void {
        return autorun(() => this.selectionValue?.setKeepSelection?.(() => true));
    }
}
