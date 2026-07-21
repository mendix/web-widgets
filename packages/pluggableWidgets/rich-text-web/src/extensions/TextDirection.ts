import { Extension } from "@tiptap/core";

export interface TextDirectionOptions {
    types: string[];
    directions: string[];
    defaultDirection: string;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        textDirection: {
            /**
             * Set text direction
             */
            setTextDirection: (direction: string) => ReturnType;
            /**
             * Unset text direction
             */
            unsetTextDirection: () => ReturnType;
        };
    }
}

export const TextDirection = Extension.create<TextDirectionOptions>({
    name: "textDirection",

    addOptions() {
        return {
            types: ["paragraph", "heading"],
            directions: ["ltr", "rtl"],
            defaultDirection: "ltr"
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    dir: {
                        default: this.options.defaultDirection,
                        parseHTML: element => element.getAttribute("dir") || this.options.defaultDirection,
                        renderHTML: attributes => {
                            if (!attributes.dir || attributes.dir === this.options.defaultDirection) {
                                return {};
                            }

                            return {
                                dir: attributes.dir
                            };
                        }
                    }
                }
            }
        ];
    },

    addCommands() {
        return {
            setTextDirection:
                direction =>
                ({ commands }) => {
                    if (!this.options.directions.includes(direction)) {
                        return false;
                    }

                    return this.options.types.every(type => commands.updateAttributes(type, { dir: direction }));
                },
            unsetTextDirection:
                () =>
                ({ commands }) => {
                    return this.options.types.every(type => commands.resetAttributes(type, "dir"));
                }
        };
    }
});
