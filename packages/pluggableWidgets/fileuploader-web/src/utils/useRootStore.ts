import { useEffect, useState } from "react";
import { FileUploaderStore } from "../stores/FileUploaderStore";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";

export function useRootStore(props: FileUploaderContainerProps): FileUploaderStore {
    const [rootStore] = useState(() => {
        return new FileUploaderStore(props);
    });

    useEffect(() => {
        rootStore.updateProps(props);
    });

    return rootStore;
}
