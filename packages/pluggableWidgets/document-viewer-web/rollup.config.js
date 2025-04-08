import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config, _index) => {
        config.output.inlineDynamicImports = true;
        if (config.output.format !== "es") {
            return config;
        }
        return {
            ...config,
            plugins: [
                ...config.plugins.map(plugin => {
                    if (plugin && plugin.name === "commonjs") {
                        // replace common js plugin that transforms
                        // external requires to imports
                        // this is needed in order to work with modern client
                        return commonjs({
                            extensions: [".js", ".jsx", ".tsx", ".ts"],
                            transformMixedEsModules: true,
                            requireReturnsDefault: "auto",
                            esmExternals: true
                        });
                    }

                    return plugin;
                }),
                // rollup config for pdfjs-dist copying from https://github.com/unjs/unpdf/blob/main/pdfjs.rollup.config.ts
                replace({
                    delimiters: ["", ""],
                    preventAssignment: true,
                    values: {
                        // Disable the `window` check (for requestAnimationFrame).
                        "typeof window": '"undefined"',
                        // Imitate the Node.js environment for all serverless environments, unenv will
                        // take care of the remaining Node.js polyfills. Keep support for browsers.
                        "const isNodeJS = typeof": 'const isNodeJS = typeof document === "undefined" // typeof',
                        // Force inlining the PDF.js worker.
                        "await import(/*webpackIgnore: true*/this.workerSrc)": "__pdfjsWorker__",
                        // Tree-shake client worker initialization logic.
                        "!PDFWorkerUtil.isWorkerDisabled && !PDFWorker.#mainThreadWorkerMessageHandler": "false"
                    }
                })
            ]
        };
    });
};
