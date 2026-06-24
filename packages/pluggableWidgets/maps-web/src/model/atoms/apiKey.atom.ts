import { computed } from "mobx";
import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { MapsContainerProps } from "../../../typings/MapsProps";

export function apiKeyAtom(gate: DerivedPropsGate<MapsContainerProps>): ComputedAtom<string | null> {
    let cached: string | null = null;
    return computed(() => {
        if (cached !== null) return cached;
        const value =
            gate.props.apiKeyExp !== undefined ? gate.props.apiKeyExp.value || null : gate.props.apiKey || null;
        if (value) cached = value;
        return value;
    });
}
