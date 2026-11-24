import path from "node:path";
import config from "@mendix/eslint-config-web-widgets/widget-ts.mjs";

const src = path.join(import.meta.dirname, "src");
const at = dir => path.join(src, dir);
const rootFiles = `${src}/*.{ts,tsx}`;
const rootDirs = ["editor", "__tests__"].map(at);

const features = [
    "columns",
    "data-export",
    "datasource",
    "empty-message",
    "pagination",
    "personalization",
    "row-interaction",
    "selection"
];

function zones({ allowRootImports }) {
    const featureZones = features.flatMap(feature =>
        features
            .filter(other => other !== feature)
            .map(other => ({
                target: at(`features/${feature}`),
                from: at(`features/${other}`),
                except: ["./tokens.ts"],
                message: `Import features/${other} through its tokens.ts.`
            }))
    );

    const rootZones = [
        { target: at("features"), from: rootDirs, message: "Features must not import the composition root." },
        { target: at("features"), from: rootFiles, message: "Features must not import the composition root." }
    ];

    return [
        {
            target: at("features/core"),
            from: at("features"),
            except: ["./core"],
            message: "features/core must not import other features."
        },
        { target: at("ui"), from: at("features"), message: "ui must not import features." },
        { target: at("ui"), from: rootDirs, message: "ui must not import the composition root." },
        { target: at("ui"), from: rootFiles, message: "ui must not import the composition root." },
        ...featureZones,
        ...(allowRootImports ? [] : rootZones)
    ];
}

export default [
    ...config,
    {
        files: ["src/**/*.{ts,tsx}"],
        settings: {
            "import-x/resolver": { node: { extensions: [".ts", ".tsx", ".js"] } }
        },
        rules: {
            "import-x/no-restricted-paths": ["error", { zones: zones({ allowRootImports: false }) }]
        }
    },
    {
        files: ["src/**/__tests__/**"],
        rules: {
            "import-x/no-restricted-paths": ["error", { zones: zones({ allowRootImports: true }) }]
        }
    }
];
