import { useEffect, useState } from "react";
import { FileDropperStore } from "../stores/FileDropperStore";
import { FileDropperContainerProps } from "../../typings/FileDropperProps";

export function useRootStore(props: FileDropperContainerProps): FileDropperStore {
    const [rootStore] = useState(() => {
        return new FileDropperStore(props);
    });

    useEffect(() => {
        rootStore.updateProps(props);
    });

    return rootStore;
}
