import { defineConfig, UserConfig } from "vite";
import copy from "rollup-plugin-copy";

interface WidgetArgs {
    /** usually the package name, e.g. @mendix/badge-web */
    widgetName?: string;
}

export default function viteConfig(args: WidgetArgs = {}): UserConfig {
    return defineConfig({
        build: {
            target: "es2019",
            lib: {
                entry: "src/index.ts",
                formats: ["es", "cjs"],
                fileName: "index"
            },
            rollupOptions: {
                output: {
                    inlineDynamicImports: true
                },
                external: ["react", "react-dom", "@mendix/widget-plugin-component-kit"]
            }
        },
        plugins: [
            {
                name: "copy-default-files",
                generateBundle() {
                    copy({
                        targets: [
                            {
                                src: "dist/locales",
                                dest: "dist/tmp/widgets",
                                flatten: false
                            },
                            {
                                src: "../../../LICENSE",
                                dest: "dist/tmp/widgets",
                                rename: "License.txt"
                            },
                            {
                                src: "Siemens*READMEOSS*.html",
                                dest: "dist/tmp/widgets",
                                flatten: true
                            }
                        ]
                    });
                }
            }
        ]
    });
}
