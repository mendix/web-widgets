import { useEffect, useState } from "react";
import { FileUploaderStore } from "../stores/FileUploaderStore";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { useInitTranslationsStore } from "./useTranslationsStore";

export function useRootStore(props: FileUploaderContainerProps): FileUploaderStore {
    const translations = useInitTranslationsStore(props);
    const [rootStore] = useState(() => {
        return new FileUploaderStore(props, translations);
    });

    useEffect(() => {
        rootStore.updateProps(props);
    });

    return rootStore;
}
