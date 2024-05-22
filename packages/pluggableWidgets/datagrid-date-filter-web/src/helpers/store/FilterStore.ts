import { TypedEventTarget, FilterTypeEnum } from "../base-types";

type State =
    | {
          value: Date | null;
          filterType: Exclude<FilterTypeEnum, "between">;
      }
    | {
          value: [Date | null, Date | null];
          filterType: "between";
      };

type Value = State["value"];

export type ChangeEventHandler = (event: CustomEvent<State>) => void;

export class FilterStore extends (EventTarget as TypedEventTarget<{
    change: CustomEvent<State>;
    init: CustomEvent<State>;
}>) {
    state: State;

    constructor(init: State = { filterType: "equal", value: null }) {
        super();
        this.state = { ...init };
    }

    #emitChange(): void {
        const payload = structuredClone(this.state);
        this.dispatchEvent(new CustomEvent("change", { detail: payload }));
    }

    #emitInit(): void {
        const payload = structuredClone(this.state);
        this.dispatchEvent(new CustomEvent("init", { detail: payload }));
    }

    setType = (t: FilterTypeEnum): void => {
        if (this.state.filterType === t) {
            return;
        }
        this.#changeState(s => {
            s.filterType = t;
            if (t === "between") {
                s.value = [null, null];
            } else if (Array.isArray(s.value)) {
                s.value = null;
            }
        });
    };

    setValue = (value: Value): void => {
        if (!this.canAssignWithType(this.state.filterType, value)) {
            return;
        }

        if (this.valuesEqual(this.state.value, value)) {
            return;
        }

        this.#changeState(s => (s.value = value));
    };

    reset = (resetState?: State): void => {
        this.state = resetState ? resetState : { filterType: "equal", value: null };
        this.#emitChange();
    };

    connected(): void {
        this.#emitInit();
    }

    #changeState(mutate: (state: State) => void): void {
        const next = structuredClone(this.state);
        mutate(next);
        this.state = next;
        this.#emitChange();
    }

    valuesEqual(a: Value, b: Value): boolean {
        if (a instanceof Date) {
            return b instanceof Date && +a === +b;
        }
        if (Array.isArray(a)) {
            if (Array.isArray(b)) {
                const [a1, a2] = a;
                const [b1, b2] = b;
                return this.valuesEqual(a1, b1) && this.valuesEqual(a2, b2);
            }
            return false;
        }

        return a === b;
    }

    canAssignWithType(type: FilterTypeEnum, value: Value): boolean {
        return type === "between" ? Array.isArray(value) : !Array.isArray(value);
    }
}
