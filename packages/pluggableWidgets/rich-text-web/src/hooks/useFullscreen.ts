import { useState, useCallback, useEffect } from "react";

export function useFullscreen(): [boolean, () => void] {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prevState => !prevState);
    }, []);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [isFullscreen]);

    return [isFullscreen, toggleFullscreen];
}
