import { useEffect, useState } from "react";

export function useScheduleUpdateOnce(predicate: () => boolean): void {
    const [isCalled, setIsCalled] = useState(false);

    const condition = predicate() && !isCalled;

    useEffect(() => {
        if (condition) {
            setTimeout(() => setIsCalled(true), 0);
        }
    }, [condition]);
}
