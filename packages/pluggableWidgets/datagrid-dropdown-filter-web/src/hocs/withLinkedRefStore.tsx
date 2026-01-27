import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { RefFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/RefFilterStore";
import { FilterAPI, useFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { BaseStoreProvider } from "@mendix/widget-plugin-filtering/custom-filter-api/BaseStoreProvider";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { AssociationMetaData, ListAttributeValue, ListExpressionValue, ListValue } from "mendix";
import { ReactElement, useEffect } from "react";
import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";
import { RefFilterProps } from "../components/typings";

type WidgetProps = Pick<
    DatagridDropdownFilterContainerProps,
    | "name"
    | "refEntity"
    | "refOptions"
    | "refCaption"
    | "refCaptionExp"
    | "refCaptionSource"
    | "refSearchAttr"
    | "fetchOptionsLazy"
>;

export interface RequiredProps {
    name: string;
    refEntity: AssociationMetaData;
    refOptions: ListValue;
    refCaption: ListAttributeValue<string> | ListExpressionValue<string>;
    searchAttrId?: ListAttributeValue["id"];
    fetchOptionsLazy: boolean;
}

type Component<P extends object> = (props: P) => ReactElement;

export function withLinkedRefStore<P extends WidgetProps>(Cmp: Component<P & RefFilterProps>): Component<P> {
    function StoreProvider(props: P & { filterAPI: FilterAPI }): ReactElement {
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

    if (props.refCaptionSource === "attr") {
        if (!props.refCaption) {
            throw new Error("RefFilterStoreProvider: 'Caption' settings is required");
        }
        return {
            name: props.name,
            refEntity: props.refEntity,
            refOptions: props.refOptions,
            refCaption: props.refCaption,
            searchAttrId: props.refCaption.id,
            fetchOptionsLazy: props.fetchOptionsLazy
        };
    } else {
        if (!props.refCaptionExp) {
            throw new Error("RefFilterStoreProvider: 'Caption' settings is required");
        }
        return {
            name: props.name,
            refEntity: props.refEntity,
            refOptions: props.refOptions,
            refCaption: props.refCaptionExp,
            searchAttrId: props.refSearchAttr?.id,
            fetchOptionsLazy: props.fetchOptionsLazy
        };
    }
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
            initCond: null
        });
    }

    get store(): RefFilterStore {
        return this._store;
    }
}
