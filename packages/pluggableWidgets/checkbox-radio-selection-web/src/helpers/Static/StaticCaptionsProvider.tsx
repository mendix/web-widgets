import { DynamicValue } from "mendix";
import { ReactNode } from "react";
import {
    OptionsSourceCustomContentTypeEnum,
    OptionsSourceStaticDataSourceType
} from "../../../typings/CheckboxRadioSelectionProps";
import { CaptionsProvider } from "../types";

interface StaticCaptionsProviderProps {
    emptyOptionText?: DynamicValue<string>;
    customContentType: OptionsSourceCustomContentTypeEnum;
    caption?: string;
}

export class StaticCaptionsProvider implements CaptionsProvider {
    emptyCaption = "";
    formatter?: undefined;
    private _objectsMap: Map<string, OptionsSourceStaticDataSourceType>;
    private customContentType: OptionsSourceCustomContentTypeEnum = "no";

    constructor(objectsMap: Map<string, OptionsSourceStaticDataSourceType>) {
        this._objectsMap = objectsMap;
    }

    updateProps(props: StaticCaptionsProviderProps): void {
        if (!props.emptyOptionText || props.emptyOptionText.status === "unavailable") {
            this.emptyCaption = "";
        } else {
            this.emptyCaption = props.emptyOptionText.value!;
        }
        this.customContentType = props.customContentType;
    }

    get(value: string | null): string {
        if (value === null) {
            return this.emptyCaption;
        }

        const item = this._objectsMap.get(value);
        if (!item) {
            return "";
        }

        return item.staticDataSourceCaption.value || "";
    }

    getCustomContent(value: string | null): ReactNode | null {
        if (value === null) {
            return null;
        }
        const item = this._objectsMap.get(value);
        if (!item) {
            return null;
        }

        return item.staticDataSourceCustomContent;
    }

    render(value: string | null): ReactNode {
        if (this.customContentType === "yes") {
            return this.getCustomContent(value);
        }
        return this.get(value);
    }
}
