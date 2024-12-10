import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { DynamicValue } from "mendix";
import { makeObservable, observable } from "mobx";

const translationProps: Array<keyof FileUploaderContainerProps> = [];

export class TranslationsStore {
    translationsMap: Map<keyof FileUploaderContainerProps, string> = new Map();

    constructor(props: FileUploaderContainerProps) {
        Object.keys(props).forEach((key: keyof FileUploaderContainerProps) => {
            if (key.endsWith("Message")) {
                translationProps.push(key);
            }
        });

        makeObservable(this, {
            translationsMap: observable
        });
    }

    updateProps(props: FileUploaderContainerProps): void {
        for (const key of translationProps) {
            const prop = props[key] as DynamicValue<string>;

            this.translationsMap.set(key, prop.value ?? "...");
        }
    }

    get(key: keyof FileUploaderContainerProps, ...substitutions: string[]): string {
        const translation = this.translationsMap.get(key);
        if (!translation) {
            console.error(`${key} is not valid key for translations.`);
            return "<...>";
        }

        // replace ### with substitutions
        return translation.replace(/###/g, () => substitutions.shift() || "");
    }
}
