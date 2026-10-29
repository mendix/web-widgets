import { ReferenceSetValue, ReferenceValue } from "mendix";
import { makeObservable, override } from "mobx";
import { BaseDatasourceOptionsProvider, BaseProps } from "../BaseDatasourceOptionsProvider";

type Props = BaseProps & {
    attr: ReferenceValue | ReferenceSetValue;
};

export class AssociationOptionsProvider extends BaseDatasourceOptionsProvider {
    constructor(...args: ConstructorParameters<typeof BaseDatasourceOptionsProvider>) {
        super(...args);
        makeObservable(this, { _updateProps: override });
    }

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
