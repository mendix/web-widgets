import { SelectionDynamicProps } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate, MappedGate } from "@mendix/widget-plugin-mobx-kit/main";
import { MainGateProps } from "../../../typings/MainGateProps";

export class SelectionGate extends MappedGate<MainGateProps, SelectionDynamicProps> {
    constructor(gate: DerivedPropsGate<MainGateProps>) {
        super(gate, map);
    }
}

function map(props: MainGateProps): SelectionDynamicProps {
    return {
        selection: props.itemSelection,
        datasource: props.datasource,
        onSelectionChange: props.onSelectionChange
    };
}
