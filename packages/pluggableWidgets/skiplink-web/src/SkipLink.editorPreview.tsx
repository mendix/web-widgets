import { ReactElement } from "react";
import { SkipLinkPreviewProps } from "../typings/SkipLinkProps";

export const preview = (props: SkipLinkPreviewProps): ReactElement => {
    const hasListItems = props.listContentId && props.listContentId.length > 0;

    if (props.renderMode === "xray") {
        return (
            <div style={{ position: "relative", minHeight: 40 }}>
                <div
                    className="widget-skip-link-container"
                    style={{ position: "relative", transform: "none", ...props.styleObject }}
                >
                    <a href={`#${props.mainContentId}`} className="widget-skip-link">
                        {`${props.skipToPrefix} ${props.linkText}`}
                    </a>
                    {hasListItems &&
                        props.listContentId.map((item, index) => (
                            <a key={index} href={`#${item.contentIdInList}`} className="widget-skip-link">
                                {`${props.skipToPrefix} ${item.LinkTextInList || item.contentIdInList}`}
                            </a>
                        ))}
                </div>
            </div>
        );
    } else {
        return (
            <div
                className="widget-skip-link-container"
                style={{ position: "relative", transform: "none", ...props.styleObject }}
            >
                <a href={`#${props.mainContentId}`} className="widget-skip-link">
                    {`${props.skipToPrefix} ${props.linkText}`}
                </a>
                {hasListItems &&
                    props.listContentId.map((item, index) => (
                        <a key={index} href={`#${item.contentIdInList}`} className="widget-skip-link">
                            {`${props.skipToPrefix} ${item.LinkTextInList || item.contentIdInList}`}
                        </a>
                    ))}
            </div>
        );
    }
};

export function getPreviewCss(): string {
    return require("./ui/SkipLink.scss");
}
