import { createElement } from "react";

export function Badge(props: { children: React.ReactNode; style?: React.CSSProperties }): React.ReactElement {
    return (
        <div
            className="corner-badge"
            style={{
                position: "absolute",
                color: "var(--highlightSelectionColor)",
                background: "var(--highlightSelectionBackground)",
                fontSize: 10,
                // fontFamily: "monospace",
                top: 0,
                padding: "2px 8px",
                borderRadius: 3,
                ...props.style
            }}
        >
            {props.children}
        </div>
    );
}
