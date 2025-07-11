import { OptionsSourceCustomContentTypeEnum } from "../../../typings/SelectionControlsProps";
import { SimpleCaptionsProvider } from "./SimpleCaptionsProvider";
import { createElement, ReactNode, ComponentType } from "react";
interface PreviewProps {
    customContentRenderer:
        | ComponentType<{ children: ReactNode; caption?: string }>
        | Array<ComponentType<{ children: ReactNode; caption?: string }>>;
    customContentType: OptionsSourceCustomContentTypeEnum;
}

export class PreviewCaptionsProvider extends SimpleCaptionsProvider {
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

    render(value: string | null, htmlFor?: string): ReactNode {
        return super.render(value, htmlFor);
    }
}
