import { action, autorun, makeAutoObservable, observable } from "mobx";
import { SetupComponentHost, SetupComponent, disposeBatch, ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";

export type JSONString = string;

export interface EditableChartStoreProps {
    layout: Record<string, unknown>;
    config: Record<string, unknown>;
    data: Array<Record<string, unknown>>;
}
export class EditableChartStore implements SetupComponent {
    layout: Record<string, unknown> = {};
    config: Record<string, unknown> = {};
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

    get layoutJson(): JSONString {
        return JSON.stringify(this.layout);
    }

    setLayout(layout: Record<string, unknown>): void {
        if (layout != null) {
            this.layout = { ...layout };
        }
    }

    get configJson(): JSONString {
        return JSON.stringify(this.config);
    }

    setConfig(config: Record<string, unknown>): void {
        if (config != null) {
            this.config = { ...config };
        }
    }

    get dataJson(): JSONString[] {
        return this.data.map(item => JSON.stringify(item));
    }

    private setData(data: Array<Record<string, unknown>>): void {
        if (!Array.isArray(data)) {
            throw new Error(`setData expects an array, got ${typeof data}`);
        }
        this.data = [...data];
    }

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
