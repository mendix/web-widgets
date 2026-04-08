import { action, autorun, makeAutoObservable, observable } from "mobx";
import { SetupComponentHost, SetupComponent, disposeBatch, ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";

export type JSONString = string;

export interface EditableChartStoreProps {
    layout: Record<string, unknown>;
    config: Record<string, unknown>;
    data: Array<Record<string, unknown>>;
}

/**
 * EditableChartStore holds the current layout, configuration, and data for a chart.
 * These fields are made observable by MobX so any component relying on them
 * will automatically react to changes.
 */
export class EditableChartStore implements SetupComponent {
    /**
     * Current layout configuration.
     */
    layout: Record<string, unknown> = {};

    /**
     * Current configuration object.
     */
    config: Record<string, unknown> = {};

    /**
     * Array of data items.
     */
    data: Array<Record<string, unknown>> = [];

    constructor(
        host: SetupComponentHost,
        private props: ComputedAtom<EditableChartStoreProps>
    ) {
        host.add(this);
        makeAutoObservable(this, {
            layout: observable.ref,
            config: observable.ref,
            data: observable.ref,
            setup: false,
            setLayout: action,
            setConfig: action,
            setDataAt: action,
            reset: action
        });
    }

    setup(): (() => void) | void {
        const [add, disposeAll] = disposeBatch();

        add(
            autorun(() => {
                const props = this.props.get();
                this.reset(props.layout, props.config, props.data);
            })
        );

        return disposeAll;
    }

    /**
     * JSON string representation of the current layout.
     * @returns Stringified layout object.
     */
    get layoutJson(): JSONString {
        return JSON.stringify(this.layout);
    }

    /**
     * Replace the layout with a shallow copy of the provided object.
     * Null/undefined values are ignored to prevent accidental clearing.
     * @param layout - New layout object (will be shallow-copied)
     */
    setLayout(layout: Record<string, unknown>): void {
        if (layout != null) {
            this.layout = { ...layout };
        }
    }

    /**
     * JSON string representation of the current configuration.
     * @returns Stringified configuration object.
     */
    get configJson(): JSONString {
        return JSON.stringify(this.config);
    }

    /**
     * Replace the configuration with a shallow copy of the provided object.
     * @param config - New config object (will be shallow-copy)
     */
    setConfig(config: Record<string, unknown>): void {
        if (config != null) {
            this.config = { ...config };
        }
    }

    /**
     * JSON string representation of the current data array.
     * @returns Stringified data array.
     */
    get dataJson(): JSONString[] {
        return this.data.map(item => JSON.stringify(item));
    }

    /**
     * Replace the entire data array with a validated copy.
     * Throws if the input is not an array.
     * @param data - New data array to set
     */
    private setData(data: Array<Record<string, unknown>>): void {
        if (!Array.isArray(data)) {
            throw new Error(`setData expects an array, got ${typeof data}`);
        }
        this.data = [...data];
    }

    /**
     * Parse a JSON string and replace the data item at the given index.
     * Performs error handling for invalid JSON or malformed objects.
     * @param index - Position in the data array to replace
     * @param jsonString - JSON string representing the new item
     */
    setDataAt(index: number, jsonString: string): void {
        if (index < 0 || index >= this.data.length) {
            return;
        }

        try {
            const parsed = JSON.parse(jsonString);
            if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
                const nextData = [...this.data];
                nextData[index] = parsed as Record<string, unknown>;
                this.data = nextData;
            }
        } catch (error) {
            console.warn(`Invalid JSON in setDataAt at index ${index}:`, jsonString, error);
        }
    }

    /**
     * Reset the entire store with new layout, configuration, and data objects.
     * Each argument is shallow-copied into the corresponding field.
     * @param layout - New layout object
     * @param config - New config object
     * @param data - New data array
     */
    reset(
        layout: Record<string, unknown>,
        config: Record<string, unknown>,
        data: Array<Record<string, unknown>>
    ): void {
        this.setLayout(layout);
        this.setConfig(config);
        this.setData(data);
    }
}
