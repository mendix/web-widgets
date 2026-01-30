import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { ObjectItem } from "mendix";
import { computed } from "mobx";
import { GalleryGateProps } from "../../typings/GalleryGateProps";

/** @injectable */
export function itemsAtom(gate: DerivedPropsGate<GalleryGateProps>): ComputedAtom<ObjectItem[]> {
    return computed(() => {
        return gate.props.datasource?.items ?? [];
    });
}
