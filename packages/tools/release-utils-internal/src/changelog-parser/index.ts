import { readFileSync, writeFileSync } from "fs";
import { Version } from "../version";
import { parse as parseWidgetChangelogFile } from "./parser/widget/widget";
import { parse as parseModuleChangelogFile } from "./parser/module/module";
import {
    LogSection,
    ModuleChangelogFile,
    ModuleReleasedVersionEntry,
    ModuleUnreleasedVersionEntry,
    NoteEntry,
    ReleasedVersionEntry,
    SubComponentEntry,
    UnreleasedVersionEntry,
    VersionEntry,
    WidgetChangelogFile
} from "./types";
import { join } from "path";

export function readModuleChangelog(filePath: string, moduleName: string): ModuleChangelogFile {
    const fileContent = readFileSync(filePath);

    return Object.freeze(parseModuleChangelogFile(fileContent.toString(), { Version, moduleName }));
}

export function writeModuleChangelog(filePath: string, content: ModuleChangelogFile): void {
    const fileContent =
        [
            ...formatHeader(content.header),
            ...content.content.flatMap(v => formatModuleVersionEntry(v, content.moduleName))
        ].join("\n\n") + "\n";

    writeFileSync(filePath, fileContent);
}

function formatHeader(header: string): string[] {
    return [
        "# Changelog",
        header,
        "The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)."
    ];
}

function formatModuleVersionEntry(
    v: NoteEntry | ModuleReleasedVersionEntry | ModuleUnreleasedVersionEntry,
    moduleName: string
): string[] {
    if (v.type === "note") {
        return [`## ${v.title}`, v.text];
    }

    return [
        v.type === "normal" ? `## [${v.version.format()}] ${moduleName} - ${formatDate(v.date)}` : "## [Unreleased]",
        ...v.sections.flatMap(formatSectionEntry(3)),
        ...v.subcomponents.flatMap(formatSubcomponentEntry)
    ];
}

function formatSubcomponentEntry(v: SubComponentEntry): string[] {
    let result: string[] = [];
    if ("version" in v) {
        result.push(`### [${v.version.format()}] ${v.name}`);
    } else {
        result.push(`### ${v.name}`);
    }

    result = result.concat(v.sections.flatMap(formatSectionEntry(4)));

    return result;
}

function formatVersionEntry(v: VersionEntry): string[] {
    if (v.type === "note") {
        return [`## ${v.title}`, v.text];
    }

    return [
        v.type === "normal" ? `## [${v.version.format()}] - ${formatDate(v.date)}` : "## [Unreleased]",
        ...v.sections.flatMap(formatSectionEntry(3))
    ];
}

const formatSectionEntry =
    (depth = 3) =>
    (s: LogSection): string[] => {
        return [`${"#".repeat(depth)} ${s.type}`, ...s.logs.map(formatChangeEntry)];
    };

function formatChangeEntry(c: string): string {
    return `-   ${c}`;
}

function formatDate(date: Date): string {
    return `${date?.getFullYear()}-${(date?.getMonth() + 1).toString().padStart(2, "0")}-${date
        ?.getDate()
        .toString()
        .padStart(2, "0")}`;
}

export class WidgetChangelogFileWrapper {
    changelog: WidgetChangelogFile;

    private constructor(changelog: WidgetChangelogFile, public changelogPath: string) {
        this.changelog = Object.freeze(changelog);
    }

    save(): void {
        const fileContent =
            [...formatHeader(this.changelog.header), ...this.changelog.content.flatMap(formatVersionEntry)].join(
                "\n\n"
            ) + "\n";

        writeFileSync(this.changelogPath, fileContent);
    }

    hasVersion(version: Version): boolean {
        return this.changelog.content.some(c => "version" in c && c.version.equals(version));
    }

    hasUnreleasedLogs(): boolean {
        return this.changelog.content[0].sections.length !== 0;
    }

    moveUnreleasedToVersion(newVersion: Version): WidgetChangelogFileWrapper {
        const [unreleased, ...releasedContent] = this.changelog.content;

        if (unreleased.sections.length === 0) {
            throw new Error("Unreleased section is empty");
        }

        const emptyUnreleased: UnreleasedVersionEntry = {
            type: "unreleased",
            sections: []
        };

        const newRelease: ReleasedVersionEntry = {
            type: "normal",
            version: newVersion,
            date: new Date(),
            sections: unreleased.sections
        };

        return new WidgetChangelogFileWrapper(
            {
                header: this.changelog.header,
                content: [emptyUnreleased, newRelease, ...releasedContent]
            },
            this.changelogPath
        );
    }

    static fromFile(filePath: string): WidgetChangelogFileWrapper {
        return new WidgetChangelogFileWrapper(
            parseWidgetChangelogFile(readFileSync(filePath).toString(), { Version }),
            filePath
        );
    }
}

export class ModuleChangelogFileWrapper {
    changelog: ModuleChangelogFile;
    moduleName: string;

    private constructor(changelog: ModuleChangelogFile, public changelogPath: string) {
        this.changelog = Object.freeze(changelog);
        this.moduleName = changelog.moduleName;
    }

    save(): void {
        const fileContent =
            [
                ...formatHeader(this.changelog.header),
                ...this.changelog.content.flatMap(entry => {
                    return formatModuleVersionEntry(entry, this.moduleName);
                })
            ].join("\n\n") + "\n";

        writeFileSync(this.changelogPath, fileContent);
    }

    hasVersion(version: Version): boolean {
        return this.changelog.content.some(c => "version" in c && c.version.equals(version));
    }

    hasUnreleasedLogs(): boolean {
        return this.changelog.content[0].sections.length !== 0;
    }

    moveUnreleasedToVersion(newVersion: Version): ModuleChangelogFileWrapper {
        const [unreleased, ...releasedContent] = this.changelog.content;

        if (unreleased.sections.length === 0) {
            throw new Error("Unreleased section is empty");
        }

        const emptyUnreleased: ModuleUnreleasedVersionEntry = {
            type: "unreleased",
            sections: [],
            subcomponents: []
        };

        const newRelease: ModuleReleasedVersionEntry = {
            type: "normal",
            version: newVersion,
            date: new Date(),
            name: this.moduleName,
            sections: unreleased.sections,
            subcomponents: unreleased.subcomponents
        };

        return new ModuleChangelogFileWrapper(
            {
                header: this.changelog.header,
                content: [emptyUnreleased, newRelease, ...releasedContent],
                moduleName: this.moduleName
            },
            this.changelogPath
        );
    }

    static fromFile(filePath: string, moduleName: string): ModuleChangelogFileWrapper {
        return new ModuleChangelogFileWrapper(
            parseModuleChangelogFile(readFileSync(filePath).toString(), { Version, moduleName }),
            filePath
        );
    }
}

export async function getWidgetChangelog(path: string): Promise<WidgetChangelogFileWrapper> {
    return WidgetChangelogFileWrapper.fromFile(join(path, "CHANGELOG.md"));
}

export async function getModuleChangelog(path: string, moduleName: string): Promise<ModuleChangelogFileWrapper> {
    return ModuleChangelogFileWrapper.fromFile(join(path, "CHANGELOG.md"), moduleName);
}
