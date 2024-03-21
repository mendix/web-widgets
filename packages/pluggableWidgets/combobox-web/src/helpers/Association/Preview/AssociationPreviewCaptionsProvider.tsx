import { CaptionPlacement } from "src/helpers/types";
import { CaptionContent } from "src/helpers/utils";
import { OptionsSourceAssociationCustomContentTypeEnum } from "typings/ComboboxProps";
import { AssociationSimpleCaptionsProvider } from "../AssociationSimpleCaptionsProvider";
import { createElement, ReactNode, ComponentType } from "react";
interface PreviewProps {
    customContentRenderer:
        | ComponentType<{ children: ReactNode; caption?: string }>
        | Array<ComponentType<{ children: ReactNode; caption?: string }>>;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
}

export class AssociationPreviewCaptionsProvider extends AssociationSimpleCaptionsProvider {
    emptyCaption = "Combo box";
    private customContentRenderer: ComponentType<{ children: ReactNode; caption?: string }> = () => <div></div>;
    get(value: string | null): string {
        return value || this.emptyCaption;
    }

    getCustomContent(value: string | null): ReactNode | null {
        if (value === null) {
            return null;
        }
        if (this.customContentType !== "no") {
            return (
                <this.customContentRenderer caption={"CUSTOM CONTENT"}>
                    <div />
                </this.customContentRenderer>
            );
        }
    }

    updatePreviewProps(props: PreviewProps): void {
        this.customContentRenderer = props.customContentRenderer as ComponentType<{
            children: ReactNode;
            caption?: string | undefined;
        }>;
        this.customContentType = props.customContentType;
    }

    render(value: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode {
        // always render custom content dropzone in design mode if type is options only
        if (placement === "options") {
            return <CaptionContent htmlFor={htmlFor}>{this.get(value)}</CaptionContent>;
        }

        return super.render(value, placement === "label" ? "options" : placement);
    }
}
