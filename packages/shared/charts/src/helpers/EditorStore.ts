export type JSONString = string;

export interface EditorStoreState {
    /** This prop holds layout options */
    layout: JSONString;
    /** This prop holds config */
    config: JSONString;
    /** The rest is config for each trace. */
    data: JSONString[];
}

type Listener = () => void;

export class EditorStore {
    listeners: Listener[] = [];
    state: EditorStoreState = { layout: "{}", config: "{}", data: [] };

    set(key: "data", value: JSONString[]): void;
    set(key: "layout" | "config" | number, value: JSONString): void;
    set(...params: [number, JSONString] | ["data", JSONString[]] | ["layout" | "config", JSONString]): void {
        let changed = false;
        if (typeof params[0] === "number") {
            changed = this.setData(...params);
        } else {
            const [prop, value] = params;
            changed = this.setProp(prop, value);
        }
        if (changed) {
            this.emit();
        }
    }

    addListener(listener: Listener): () => void {
        this.listeners.push(listener);
        return () => (this.listeners = this.listeners.filter(l => l !== listener));
    }

    resetData(length = 0): void {
        this.state.data = Array(length).fill("{}");
        this.emit();
    }

    reset(state: EditorStoreState): void {
        this.state = {
            ...state,
            data: [...state.data]
        };

        this.emit();
    }

    private setData(index: number, value: JSONString): boolean {
        let changed = false;
        if (this.state.data[index] !== value) {
            this.state = { ...this.state, data: this.state.data.map((str, i) => (index === i ? value : str)) };
            changed = true;
        }
        return changed;
    }

    private setProp<T extends keyof EditorStoreState>(key: T, value: EditorStoreState[T]): boolean {
        let changed = false;
        if (this.state[key] !== value) {
            this.state = { ...this.state, [key]: value };
            changed = true;
        }
        return changed;
    }

    private emit(): void {
        this.listeners.forEach(listener => listener());
    }
}
