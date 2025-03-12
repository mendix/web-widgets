import { useState, useCallback, useEffect, MutableRefObject } from "react";
import Quill from "quill";
import Keyboard from "quill/modules/keyboard";

/**
 * Custom hook to manage fullscreen state with Quill keyboard bindings
 * @param quillRef - Reference to the Quill editor instance
 * @returns [isFullscreen, toggleFullscreen] - Current state and toggle function
 */
export function useFullscreen(quillRef: MutableRefObject<Quill | null>): [boolean, () => void] {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prevState => !prevState);
    }, []);

    // Add keyboard binding for Escape key when in fullscreen mode
    useEffect(() => {
        if (quillRef.current && isFullscreen) {
            const keyboard = quillRef.current.getModule("keyboard") as Keyboard;
            keyboard.addBinding({ key: "Escape" }, () => {
                setIsFullscreen(false);
                return false;
            });

            return () => {
                // Remove binding when component is unmounted or fullscreen state changes
                keyboard.bindings.Escape = [];
            };
        }
    }, [quillRef, isFullscreen]);

    return [isFullscreen, toggleFullscreen];
}
