import { ReferenceSetValue, ReferenceValue } from "mendix";
import { BaseDatasourceOptionsProvider, BaseProps } from "../BaseDatasourceOptionsProvider";

type Props = BaseProps & {
    attr: ReferenceValue | ReferenceSetValue;
};

export class AssociationOptionsProvider extends BaseDatasourceOptionsProvider {
    _updateProps(props: Props): void {
        super._updateProps(props);

        if (props.attr.value) {
            const selectedItems = Array.isArray(props.attr.value) ? props.attr.value : [props.attr.value];

            selectedItems.forEach(i => {
                if (!this.valuesMap.has(i.id)) {
                    this.valuesMap.set(i.id, i);
                }
            });
        }
    }
}
