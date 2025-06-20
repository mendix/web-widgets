import { useEffect, createElement } from "react";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { RefFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/RefFilterStore";
import { FilterAPI, useFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { BaseStoreProvider } from "@mendix/widget-plugin-filtering/custom-filter-api/BaseStoreProvider";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { ListValue, ListAttributeValue, AssociationMetaData } from "mendix";
import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { RefFilterProps } from "../components/typings";

type WidgetProps = Pick<DatagridDropdownFilterContainerProps, "name" | "refEntity" | "refOptions" | "refCaption">;

export interface RequiredProps {
    name: string;
    refEntity: AssociationMetaData;
    refOptions: ListValue;
    refCaption: ListAttributeValue<string>;
    searchAttrId: ListAttributeValue["id"];
}

type Component<P extends object> = (props: P) => React.ReactElement;

export function withLinkedRefStore<P extends WidgetProps>(Cmp: Component<P & RefFilterProps>): Component<P> {
    function StoreProvider(props: P & { filterAPI: FilterAPI }): React.ReactElement {
        const gate = useGate(props);
        const provider = useSetup(() => new RefStoreProvider(props.filterAPI, gate));
        return <Cmp {...props} filterStore={provider.store} parentChannelName={props.filterAPI.parentChannelName} />;
    }
    return function FilterAPIProvider(props) {
        const api = useFilterAPI();

        if (api.hasError) {
            return <Alert bootstrapStyle="danger">{api.error.message}</Alert>;
        }

        return <StoreProvider {...props} filterAPI={api.value} />;
    };
}

function mapProps(props: WidgetProps): RequiredProps {
    if (!props.refEntity) {
        throw new Error("RefFilterStoreProvider: refEntity is required");
    }

    if (!props.refOptions) {
        throw new Error("RefFilterStoreProvider: refOptions is required");
    }

    if (!props.refCaption) {
        throw new Error("RefFilterStoreProvider: refCaption is required");
    }
    return {
        name: props.name,
        refEntity: props.refEntity,
        refOptions: props.refOptions,
        refCaption: props.refCaption,
        searchAttrId: props.refCaption.id
    };
}

function useGate(props: WidgetProps): DerivedPropsGate<RequiredProps> {
    const gp = useConst(() => new GateProvider(mapProps(props)));
    useEffect(() => {
        gp.setProps(mapProps(props));
    });
    return gp.gate;
}

class RefStoreProvider extends BaseStoreProvider<RefFilterStore> {
    protected _store: RefFilterStore;
    protected filterAPI: FilterAPI;
    readonly dataKey: string;

    constructor(filterAPI: FilterAPI, gate: DerivedPropsGate<RequiredProps>) {
        super();
        this.filterAPI = filterAPI;
        this.dataKey = gate.props.name;
        this._store = new RefFilterStore({
            gate,
            initCond: this.findInitFilter(filterAPI.sharedInitFilter, this.dataKey)
        });
    }

    get store(): RefFilterStore {
        return this._store;
    }
}
