import { useEffect } from "react";

export default function useDocumentKeyDown(callback: (event: KeyboardEvent) => void): void {
    useEffect(() => {
        document.addEventListener("keydown", callback);
        return () => {
            document.removeEventListener("keydown", callback);
        };
    }, []);
}
