import { useEffect, useState } from "react";
import { useTranslationsStore } from "./useTranslationsStore";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { FileUploaderStore } from "../stores/FileUploaderStore";

export function useRootStore(props: FileUploaderContainerProps): FileUploaderStore {
    const translations = useTranslationsStore();
    const [rootStore] = useState(() => {
        return new FileUploaderStore(props, translations);
    });

    useEffect(() => {
        rootStore.updateProps(props);
    }, [rootStore, props]);

    return rootStore;
}
