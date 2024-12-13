import { createContext, createElement, ReactElement, ReactNode, useContext, useEffect, useState } from "react";
import { TranslationsStore } from "../stores/TranslationsStore";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";

function useInitTranslationsStore(props: FileUploaderContainerProps): TranslationsStore {
    const [store] = useState(() => {
        return new TranslationsStore(props);
    });

    useEffect(() => {
        store.updateProps(props);
    }, [store, props]);

    return store;
}

const TranslationsStoreContext = createContext<TranslationsStore | undefined>(undefined);

export function TranslationsStoreProvider({
    props,
    children
}: {
    children: ReactNode;
    props: FileUploaderContainerProps;
}): ReactElement {
    const store = useInitTranslationsStore(props);

    return <TranslationsStoreContext.Provider value={store}>{children}</TranslationsStoreContext.Provider>;
}

export function useTranslationsStore(): TranslationsStore {
    const context = useContext(TranslationsStoreContext);
    if (context === undefined) {
        throw new Error("useTranslationsStore must be used within TranslationsStoreProvider");
    }

    return context;
}
