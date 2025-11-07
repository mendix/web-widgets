import { ComputedAtom, createEmitter, disposeBatch, Emitter } from "@mendix/widget-plugin-mobx-kit/main";
import { reaction } from "mobx";

export type ServiceEvents = {
    loadstart: ProgressEvent;
    progress: ProgressEvent;
    done: { success: boolean };
    loadend: undefined;
};

export type UIEvents = {
    visibility: { visible: boolean };
    startSelecting: undefined;
    clear: undefined;
    abort: undefined;
};

type Handler<T, K extends keyof T> = (event: T[K]) => void;

type PrettyType<T> = { [K in keyof T]: T[K] };

export type SelectAllEvents = PrettyType<ServiceEvents & UIEvents>;

/** @injectable */
export function selectAllEmitter(): Emitter<SelectAllEvents> {
    return createEmitter<SelectAllEvents>();
}

export interface BarStore {
    pending: boolean;
    visible: boolean;
    clearBtnVisible: boolean;
    setClearBtnVisible(value: boolean): void;
    setPending(value: boolean): void;
    hideBar(): void;
    showBar(): void;
}

export interface SelectService {
    selectAllPages(): void;
    clearSelection(): void;
    abort(): void;
}

export function setupBarStore(store: BarStore, emitter: Emitter<SelectAllEvents>): () => void {
    const [add, disposeAll] = disposeBatch();

    const handleVisibility: Handler<UIEvents, "visibility"> = (event): void => {
        if (event.visible) {
            store.showBar();
        } else {
            store.hideBar();
        }
    };

    const handleLoadStart = (): void => store.setPending(true);

    const handleLoadEnd = (): void => store.setPending(false);

    const handleDone: Handler<ServiceEvents, "done"> = (event): void => {
        store.setClearBtnVisible(event.success);
    };

    add(emitter.on("visibility", handleVisibility));
    add(emitter.on("loadstart", handleLoadStart));
    add(emitter.on("loadend", handleLoadEnd));
    add(emitter.on("done", handleDone));

    return disposeAll;
}

export function setupSelectService(service: SelectService, emitter: Emitter<SelectAllEvents>): () => void {
    const [add, disposeAll] = disposeBatch();

    add(emitter.on("startSelecting", () => service.selectAllPages()));
    add(emitter.on("clear", () => service.clearSelection()));
    add(emitter.on("abort", () => service.abort()));

    return disposeAll;
}

export function setupProgressService(
    service: {
        onloadstart: (event: ProgressEvent) => void;
        onprogress: (event: ProgressEvent) => void;
        onloadend: () => void;
    },
    emitter: Emitter<SelectAllEvents>
): () => void {
    const [add, disposeAll] = disposeBatch();

    add(emitter.on("loadstart", event => service.onloadstart(event)));
    add(emitter.on("progress", event => service.onprogress(event)));
    add(emitter.on("loadend", () => service.onloadend()));

    return disposeAll;
}

export function setupVisibilityEvents(
    isPageSelected: ComputedAtom<boolean>,
    isAllSelected: ComputedAtom<boolean>,
    emitter: Emitter<SelectAllEvents>
): () => void {
    return reaction(
        () => [isPageSelected.get(), isAllSelected.get()] as const,
        ([isPageSelected, isAllSelected]) => {
            if (isPageSelected === false) {
                emitter.emit("visibility", { visible: false });
            } else if (isAllSelected === false) {
                emitter.emit("visibility", { visible: true });
            }
        }
    );
}
