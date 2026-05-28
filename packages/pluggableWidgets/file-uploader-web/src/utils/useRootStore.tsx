import { createContext, ReactElement, ReactNode, useContext, useEffect, useState } from "react";
import { useTranslationsStore } from "./useTranslationsStore";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { FileUploaderStore } from "../stores/FileUploaderStore";

function useInitRootStore(props: FileUploaderContainerProps): FileUploaderStore {
    const translations = useTranslationsStore();
    const [rootStore] = useState(() => {
        return new FileUploaderStore(props, translations);
    });

    useEffect(() => {
        rootStore.updateProps(props);
    }, [rootStore, props]);

    useEffect(() => {
        return () => rootStore.dispose();
    }, [rootStore]);

    return rootStore;
}

const RootStoreContext = createContext<FileUploaderStore | undefined>(undefined);

export function RootStoreProvider({
    props,
    children
}: {
    children: ReactNode;
    props: FileUploaderContainerProps;
}): ReactElement {
    const store = useInitRootStore(props);
    return <RootStoreContext.Provider value={store}>{children}</RootStoreContext.Provider>;
}

export function useRootStore(): FileUploaderStore {
    const context = useContext(RootStoreContext);
    if (context === undefined) {
        throw new Error("useRootStore must be used within RootStoreProvider");
    }
    return context;
}
