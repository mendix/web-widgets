import { createElement, ReactElement } from "react";

export interface SkipLinkPreviewProps {
    linkText: string;
    mainContentId: string;
}

export const preview = (props: SkipLinkPreviewProps): ReactElement => {
    return (
        <div style={{ position: "relative", height: 40 }}>
            <a
                href={`#${props.mainContentId}`}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    background: "#fff",
                    color: "#0078d4",
                    padding: "8px 16px",
                    zIndex: 1000,
                    textDecoration: "none",
                    border: "2px solid #0078d4",
                    borderRadius: 4,
                    fontWeight: "bold"
                }}
            >
                {props.linkText}
            </a>
        </div>
    );
};

export function getPreviewCss(): string {
    return require("./SkipLink.css");
}
