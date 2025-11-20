import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { ObjectItem } from "mendix";
import { computed, observable } from "mobx";
import { MainGateProps } from "../../../typings/MainGateProps";

export interface RowClassProvider {
    class: {
        get(item: ObjectItem): string;
    };
}

/** @injectable */
export function rowClassProvider(gate: DerivedPropsGate<MainGateProps>): RowClassProvider {
    const atom = {
        get class() {
            return {
                get(item: ObjectItem): string {
                    if (!gate.props.rowClass) return "";
                    return gate.props.rowClass.get(item).value ?? "";
                }
            };
        }
    };

    return observable(atom, { class: computed });
}

/** @injectable */
export function rowsAtom(gate: DerivedPropsGate<MainGateProps>): ComputedAtom<ObjectItem[]> {
    return computed(() => {
        return gate.props.datasource?.items ?? [];
    });
}
