import { createElement, ReactElement, useEffect, useRef } from "react";
import "../ui/CheckBox.scss";

interface CheckBoxProps {
    id: string;
    value: "all" | "some" | "none";
    onChange?: () => void;
}

export function CheckBox({ id, value, onChange }: CheckBoxProps): ReactElement {
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
