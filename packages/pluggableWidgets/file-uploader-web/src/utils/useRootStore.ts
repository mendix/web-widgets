import { useEffect, useState } from "react";
import { FileUploaderStore } from "../stores/FileUploaderStore";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { useTranslationsStore } from "./useTranslationsStore";

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
