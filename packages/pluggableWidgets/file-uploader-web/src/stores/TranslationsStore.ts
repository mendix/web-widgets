import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { DynamicValue } from "mendix";
import { action, makeObservable, observable } from "mobx";

export class TranslationsStore {
    translationsMap: Map<keyof FileUploaderContainerProps, string> = new Map();

    constructor(props: FileUploaderContainerProps) {
        this.updateProps(props);
        makeObservable(this, {
            translationsMap: observable,
            updateProps: action
        });
    }

    updateProps(props: FileUploaderContainerProps): void {
        Object.keys(props).forEach((key: keyof FileUploaderContainerProps) => {
            if (key.endsWith("Message")) {
                const prop = props[key] as DynamicValue<string>;

                this.translationsMap.set(key, prop.value ?? "...");
            }
        });
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
