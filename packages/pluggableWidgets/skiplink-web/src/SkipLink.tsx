import { ReactElement } from "react";
import { SkipLinkContainerProps } from "typings/SkipLinkProps";
import { SkipLinkComponent } from "./components/SkipLinkComponent";

export default function SkipLink(props: SkipLinkContainerProps): ReactElement {
    const { linkText, mainContentId, listContentId, skipToPrefix, class: className, tabIndex, name } = props;

    return (
        <SkipLinkComponent
            linkText={linkText}
            mainContentId={mainContentId}
            listContentId={listContentId}
            skipToPrefix={skipToPrefix}
            class={className}
            tabIndex={tabIndex}
            name={name}
        />
    );
}
