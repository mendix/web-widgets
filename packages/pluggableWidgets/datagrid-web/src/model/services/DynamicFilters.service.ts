import { comparer, reaction } from "mobx";
import { DynamicFilterSet } from "@mendix/widget-plugin-filtering/dynamic/DynamicFilterSet";
import { FilterFieldConfig, FilterFieldOption } from "@mendix/widget-plugin-filtering/dynamic/typings";
import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { MainGateProps } from "../../../typings/MainGateProps";

type GateProps = Pick<MainGateProps, "filterFields" | "filterFieldOptions">;

interface FilterSetConfig {
    fields: FilterFieldConfig[];
    options: FilterFieldOption[];
}

/** Owns the Dynamic Filter Set and keeps its Filter Fields in sync with props. */
export class DynamicFiltersService implements SetupComponent {
    readonly filterSet: DynamicFilterSet;

    constructor(
        host: SetupComponentHost,
        private gate: DerivedPropsGate<GateProps>
    ) {
        host.add(this);
        const { fields, options } = filterSetConfig(gate.props);
        this.filterSet = new DynamicFilterSet(fields, options);
    }

    setup(): () => void {
        return reaction(
            () => filterSetConfig(this.gate.props),
            ({ fields, options }) => this.filterSet.updateConfig(fields, options),
            { equals: sameConfig }
        );
    }
}

function filterSetConfig(props: GateProps): FilterSetConfig {
    return {
        fields: props.filterFields.map(field => ({
            key: field.key,
            attribute: field.attribute,
            label: field.label.value ?? ""
        })),
        options: props.filterFieldOptions.map(option => ({
            fieldKey: option.fieldKey,
            caption: option.caption.value ?? "",
            value: option.value.value ?? ""
        }))
    };
}

function sameConfig(a: FilterSetConfig, b: FilterSetConfig): boolean {
    return (
        a.fields.length === b.fields.length &&
        a.fields.every(
            (f, i) =>
                f.key === b.fields[i].key && f.attribute === b.fields[i].attribute && f.label === b.fields[i].label
        ) &&
        comparer.structural(a.options, b.options)
    );
}
