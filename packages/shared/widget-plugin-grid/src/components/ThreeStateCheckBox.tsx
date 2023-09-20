import { createElement, ReactElement, useEffect, useRef } from "react";

interface ThreeStateCheckBoxProps {
    id?: string;
    value: "all" | "some" | "none";
    onChange?: () => void;
}

export function ThreeStateCheckBox({ id, value, onChange }: ThreeStateCheckBoxProps): ReactElement {
    const checkboxRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (!checkboxRef.current) {
            return;
        }
        if (value === "all" || value === "none") {
            checkboxRef.current.indeterminate = false;
        } else if (value === "some") {
            checkboxRef.current.indeterminate = true;
        }
    }, [value]);

    return (
        <input
            id={id}
            type="checkbox"
            className="three-state-checkbox"
            ref={checkboxRef}
            checked={value !== "none"}
            onChange={onChange}
        />
    );
}
