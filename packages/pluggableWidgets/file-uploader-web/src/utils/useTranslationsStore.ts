import { useEffect, useState } from "react";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { TranslationsStore } from "../stores/TranslationsStore";

let translationsStore: TranslationsStore;

export function useInitTranslationsStore(props: FileUploaderContainerProps): TranslationsStore {
    const [store] = useState(() => {
        return (translationsStore = new TranslationsStore(props));
    });

    useEffect(() => {
        store.updateProps(props);
    });

    return store;
}

export function useTranslationsStore(): TranslationsStore {
    return translationsStore;
}
