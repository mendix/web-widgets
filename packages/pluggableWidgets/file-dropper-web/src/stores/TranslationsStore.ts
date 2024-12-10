import { FileDropperContainerProps } from "../../typings/FileDropperProps";
import { DynamicValue } from "mendix";
import { makeObservable, observable } from "mobx";

const translationProps: Array<keyof FileDropperContainerProps> = [];

export class TranslationsStore {
    translationsMap: Map<keyof FileDropperContainerProps, string> = new Map();

    constructor(props: FileDropperContainerProps) {
        Object.keys(props).forEach((key: keyof FileDropperContainerProps) => {
            if (key.endsWith("Message")) {
                translationProps.push(key);
            }
        });

        makeObservable(this, {
            translationsMap: observable
        });
    }

    updateProps(props: FileDropperContainerProps) {
        for (const key of translationProps) {
            const prop = props[key] as DynamicValue<string>;

            this.translationsMap.set(key, prop.value ?? "...");
        }
    }

    get(key: keyof FileDropperContainerProps, ...substitutions: string[]): string {
        const translation = this.translationsMap.get(key);
        if (!translation) {
            console.error(`${key} is not valid key for translations.`);
            return "<...>";
        }

        // replace ### with substitutions
        return translation.replace(/###/g, () => substitutions.shift() || "");
    }
}
