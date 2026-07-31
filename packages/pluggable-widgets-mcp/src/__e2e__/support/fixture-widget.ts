/**
 * Brings the warm fixture widget to a known-good, buildable state.
 *
 * Worth knowing: `set-widget-properties` replaces the widget's XML, which regenerates its typings.
 * The scaffold's own `editorPreview.tsx` and `editorConfig.ts` reference the template's `sampleText`
 * property, so they stop compiling the moment the XML changes. A real client hits this too — which
 * is why the Studio Pro preview files are part of what a caller is expected to write, not an
 * afterthought.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PACKAGE_ROOT } from "@/config";
import type { E2EServer } from "./harness";
import { WARM_WIDGET_NAME } from "./warm-cache";

const FIXTURES = join(PACKAGE_ROOT, "src", "__e2e__", "fixtures");

export interface BadgeFixture {
    description: string;
    properties: unknown[];
    systemProperties: string[];
}

export function readBadgeFixture(): BadgeFixture {
    return JSON.parse(readFileSync(join(FIXTURES, "badge.properties.json"), "utf-8")) as BadgeFixture;
}

export function readBadgeComponent(): string {
    return readFileSync(join(FIXTURES, "badge.component.tsx.txt"), "utf-8");
}

/** The files a caller must supply alongside the component for the build to succeed. */
export function supportingFiles(): Array<{ relativePath: string; content: string }> {
    const name = WARM_WIDGET_NAME;
    return [
        {
            relativePath: `src/ui/${name}.scss`,
            content: ".widget-probebadge {\n    display: inline-flex;\n    gap: 4px;\n}\n"
        },
        {
            relativePath: `src/${name}.editorPreview.tsx`,
            content:
                `import { ReactElement } from "react";\n` +
                `import { ${name}PreviewProps } from "../typings/${name}Props";\n\n` +
                `export function preview({ value }: ${name}PreviewProps): ReactElement {\n` +
                `    return <div className="widget-probebadge">{value}</div>;\n}\n`
        },
        {
            relativePath: `src/${name}.editorConfig.ts`,
            content:
                `import { ${name}PreviewProps } from "../typings/${name}Props";\n\n` +
                `export function getProperties(_values: ${name}PreviewProps, defaultProperties: unknown): unknown {\n` +
                `    return defaultProperties;\n}\n`
        }
    ];
}

/** Applies properties and every source file, leaving the widget in a state that builds cleanly. */
export async function applyBadgeFixture(server: E2EServer, widgetPath: string): Promise<void> {
    const fixture = readBadgeFixture();

    const properties = await server.call("set-widget-properties", { widgetPath, ...fixture });
    if (properties.isError) throw new Error(`fixture setup failed:\n${properties.text}`);

    const write = await server.call("write-widget-file", {
        widgetPath,
        files: [{ relativePath: `src/${WARM_WIDGET_NAME}.tsx`, content: readBadgeComponent() }, ...supportingFiles()]
    });
    if (write.isError) throw new Error(`fixture setup failed:\n${write.text}`);
}
