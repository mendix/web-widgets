import { useEffect, createElement, useMemo } from "react";
import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { RefFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/RefFilterStore";
import { FilterAPI, useFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { BaseStoreProvider } from "@mendix/widget-plugin-filtering/custom-filter-api/BaseStoreProvider";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { ListReferenceValue, ListReferenceSetValue, ListValue, ListAttributeValue } from "mendix";
import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";

type WidgetProps = Pick<DatagridDropdownFilterContainerProps, "name" | "ref" | "refOptions" | "refCaption">;

export interface RequiredProps {
    name: string;
    ref: ListReferenceValue | ListReferenceSetValue;
    refOptions: ListValue;
    refCaption: ListAttributeValue<string>;
    searchAttrId: ListAttributeValue["id"];
}

type Component<P extends object> = (props: P) => React.ReactElement;

export function withLinkedRefStore<P extends WidgetProps>(
    Cmp: Component<P & { filterStore: RefFilterStore; parentChannelName: string }>
): Component<P> {
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
    if (!props.ref) {
        throw new Error("RefFilterStoreProvider: ref is required");
    }
    if (!props.refOptions) {
        throw new Error("RefFilterStoreProvider: refOptions is required");
    }
    if (!props.refCaption) {
        throw new Error("RefFilterStoreProvider: refCaption is required");
    }
    return {
        name: props.name,
        ref: props.ref,
        refOptions: props.refOptions,
        refCaption: props.refCaption,
        searchAttrId: props.refCaption.id
    };
}

function useGate(props: WidgetProps): DerivedPropsGate<RequiredProps> {
    const gateProps = useMemo(() => mapProps(props), [props]);
    const gp = useConst(() => new GateProvider(gateProps));
    useEffect(() => {
        gp.setProps(gateProps);
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
