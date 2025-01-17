import { useEffect, useState } from "react";

export interface Setupable {
    setup(): void | (() => void);
}

export function useSetup<T extends Setupable>(props: () => T): T {
    const [obj] = useState(props);
    useEffect(() => obj.setup(), [obj]);
    return obj;
}
