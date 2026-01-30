import { SelectionDynamicProps } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate, MappedGate } from "@mendix/widget-plugin-mobx-kit/main";
import { GalleryGateProps } from "../../typings/GalleryGateProps";

export class SelectionGate extends MappedGate<GalleryGateProps, SelectionDynamicProps> {
    constructor(gate: DerivedPropsGate<GalleryGateProps>) {
        super(gate, map);
    }
}

function map(props: GalleryGateProps): SelectionDynamicProps {
    return {
        selection: props.itemSelection,
        datasource: props.datasource,
        onSelectionChange: props.onSelectionChange
    };
}
