type JSONString = string;

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

    set(key: "layout" | "config" | number, value: JSONString): void {
        const changed = typeof key === "number" ? this.setData(key, value) : this.setProp(key, value);
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

    private setData(index: number, value: JSONString): boolean {
        let changed = false;
        if (this.state.data[index] !== value) {
            this.state.data = this.state.data.map((str, i) => (index === i ? value : str));
            changed = true;
        }
        return changed;
    }

    private setProp(key: keyof EditorStoreState, value: JSONString): boolean {
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
