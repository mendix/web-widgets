import { Event, Store, createEvent, createStore, sample, split, createEffect } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { AttrStorage } from "./AttrStorage";
import { DynamicStorage, StorageDone, StoragePending, StorageReady } from "./base";
import { requestLocalStorage, returnStorage } from "./utils";

type Props = DatagridContainerProps;
type Attr = Exclude<Props["configurationAttribute"], undefined>;

export function storageUnit(
    propsUpdated: Event<Props>,
    cleanup: Event<unknown>,
    $settingsHash: Store<string>
): Store<DynamicStorage> {
    const computeLocal = createEvent<Props>();
    const computeAttr = createEvent<Props>();

    split({
        source: propsUpdated,
        match: props => (props.configurationAttribute ? "attr" : "local"),
        cases: {
            local: computeLocal,
            attr: computeAttr
        }
    });

    const $result = createStore<DynamicStorage>({ status: "pending", value: null });

    const $attr = createStore<Attr | null>(null).on(
        computeAttr.filterMap(props => {
            if (props.configurationAttribute?.status === "available") {
                return props.configurationAttribute;
            }
        }),
        (_, attr) => attr
    );

    // AttrStorage
    sample({
        clock: $attr,
        source: $settingsHash,
        fn: (hash, attr): StoragePending | StorageReady => {
            return attr === null
                ? { status: "pending", value: null }
                : { status: "ready", value: new AttrStorage(attr, hash) };
        },
        target: $result
    });

    // LocalSettingsStorage
    sample({
        clock: computeLocal,
        source: [$settingsHash, $result] as const,
        filter: ([_, state]) => state.status === "pending",
        fn: ([hash, _state], _props): StorageDone => {
            const storage = requestLocalStorage(hash);
            return storage
                ? { status: "ready", value: storage }
                : { status: "disabled", value: null, reason: "key is already in use" };
        },
        target: $result
    });

    sample({
        clock: cleanup,
        source: $settingsHash,
        target: createEffect(returnStorage)
    });

    return $result;
}
