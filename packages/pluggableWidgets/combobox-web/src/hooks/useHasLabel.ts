import { useEffect, useState } from "react";

export function useHasLabel(inputId: string): boolean {
    const [hasLabel, setHasLabel] = useState(false);

    useEffect(() => {
        const label = document.querySelector(`label[for="${inputId}"]`);

        setHasLabel(!!label);
    }, [inputId]);

    return hasLabel;
}
