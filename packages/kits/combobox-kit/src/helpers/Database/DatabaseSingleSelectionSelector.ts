import { Big } from "big.js";
import { EditableValue, SelectionSingleValue } from "mendix";
import { action, autorun, comparer, computed, makeObservable, observable, reaction, when } from "mobx";
import {
    DerivedPropsGate,
    disposeBatch,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { ComboboxConfig } from "../../core/Combobox.config";
import { SingleSelector, Status } from "../types";
import { _valuesIsEqual } from "../utils";
import { BaseDatabaseSelector, DatabaseGateProps } from "./BaseDatabaseSelector";
import { assertCompatibleTypes, getReadonly } from "./utils";

export class DatabaseSingleSelectionSelector extends BaseDatabaseSelector implements SingleSelector, SetupComponent {
    readonly type = "single";
    /** The datasource has finished loading at least once. */
    private loaded = false;

    constructor(host: SetupComponentHost, gate: DerivedPropsGate<DatabaseGateProps>, config: ComboboxConfig) {
        super(host, gate, config);
        makeObservable<this, "available" | "loaded">(this, {
            loaded: observable,
            available: computed,
            readOnly: computed,
            status: computed,
            validation: computed,
            clearable: computed,
            currentId: computed,
            setValue: action
        });
        host.add(this);
    }

    private get attr(): EditableValue<string | Big> | undefined {
        return this.gate.props.databaseAttributeString;
    }

    private get selectionValue(): SelectionSingleValue | undefined {
        return this.selection as SelectionSingleValue | undefined;
    }

    private get available(): boolean {
        return this.ds.status !== "unavailable" && this.emptyOptionAvailable;
    }

    get readOnly(): boolean {
        return getReadonly(this.attr, this.config.customEditability, this.gate.props.customEditabilityExpression);
    }

    protected get displayValue(): string | undefined {
        return this.attr?.displayValue;
    }

    get status(): Status {
        if (!this.available) {
            return "unavailable";
        }
        if (this.ds.status === "loading") {
            // Until the first page arrives the widget shows its placeholder, as the released
            // widget did; later reloads keep the control on screen.
            return this.loaded ? "loading" : "unavailable";
        }
        return this.attr?.status ?? "available";
    }

    get validation(): string | undefined {
        return this.attr?.validation;
    }

    get clearable(): boolean {
        return this.available && this.config.clearable;
    }

    /** The option whose value equals the bound attribute's; without a bound attribute, the datasource selection. */
    get currentId(): string | null {
        if (!this.available) {
            return null;
        }
        const { attr } = this;
        if (!attr) {
            return this.selectionValue?.selection?.id ?? null;
        }
        assertCompatibleTypes(attr, this.gate.props.optionsSourceDatabaseValueAttribute);
        if (!attr.value) {
            return null;
        }
        return this.options.ids.find(id => _valuesIsEqual(attr.value, this.optionValue(id))) ?? null;
    }

    setValue(id: string | null): void {
        this.attr?.setValue(this.optionValue(id));
        const selection = this.selectionValue;
        if (selection && id !== (selection.selection?.id ?? "")) {
            selection.setSelection(this.options.item(id));
        }
    }

    /**
     * Keeps the datasource selection in step with the bound attribute, and with lazy loading
     * fetches a bound value that is outside the loaded page so its caption can show.
     */
    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(autorun(() => this.selectionValue?.setKeepSelection?.(() => true)));
        add(
            when(
                () => this.ds.status !== "loading",
                action(() => {
                    this.loaded = true;
                })
            )
        );
        add(
            reaction(
                () => ({
                    value: this.attr?.value,
                    ids: this.options.ids,
                    ready: this.available && this.ds.status === "available" && this.attr?.status === "available"
                }),
                ({ value, ids, ready }) => {
                    if (!ready) {
                        return;
                    }
                    const id = this.currentId;
                    const selection = this.selectionValue;
                    if (value && id === null && ids.length <= 1) {
                        const valueAttribute = this.gate.props.optionsSourceDatabaseValueAttribute;
                        this.options.loadSelectedValue(value.toString(), valueAttribute?.id);
                    }
                    if (!value && selection?.selection) {
                        selection.setSelection(undefined);
                    }
                    if (id !== null && selection && selection.selection === undefined) {
                        selection.setSelection(this.options.item(id));
                    }
                },
                { fireImmediately: true, equals: comparer.structural }
            )
        );
        return disposeAll;
    }
}
