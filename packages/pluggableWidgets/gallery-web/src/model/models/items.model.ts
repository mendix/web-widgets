import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { ObjectItem } from "mendix";
import { computed, observable } from "mobx";
import { GalleryGateProps } from "../../typings/GalleryGateProps";

/** @injectable */
export function itemsAtom(gate: DerivedPropsGate<GalleryGateProps>): ComputedAtom<ObjectItem[]> {
    return computed(() => {
        return gate.props.datasource?.items ?? [];
    });
}

export interface ItemKeyProvider {
    key: {
        get(item: ObjectItem): string;
    };
}

/** @injectable */
export function itemKeyProvider(gate: DerivedPropsGate<GalleryGateProps>): ItemKeyProvider {
    const atom = {
        get key() {
            return {
                get(item: ObjectItem): string {
                    if (!gate.props.customItemKey) return item.id;
                    const v = gate.props.customItemKey.get(item);
                    const customKey = v.value;
                    return customKey ?? item.id;
                }
            };
        }
    };

    return observable(atom, { key: computed });
}
