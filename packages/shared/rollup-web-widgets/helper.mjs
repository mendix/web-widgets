import { existsSync, mkdirSync } from "fs";
import shelljs from "shelljs";
import fg from "fast-glob";
import { join } from "node:path";
const { cp, rm } = shelljs;

const LICENSE_GLOB = "licen(s|c)e?(.*)";

export function copyDefaultFiles(widgetDir) {
    const outDir = join(widgetDir, "dist/tmp/widgets/");
    copyDefaultLicenseFile(widgetDir);
    copyDefaultTranslationFiles(widgetDir);
}

// Copy default license in this module to the widget bundle
export function copyDefaultLicenseFile(widgetDir) {
    const outDir = join(widgetDir, "dist/tmp/widgets/");
    copyLicenseFile(import.meta.dirname, outDir);
}

export function copyLicenseFile(sourcePath, outDir) {
    const licenseFile = fg.sync([LICENSE_GLOB], {
        cwd: sourcePath,
        caseSensitiveMatch: false,
        deep: 1,
        absolute: true
    })[0];
    if (existsSync(licenseFile)) {
        mkdirSync(outDir, { recursive: true });
        cp("-u", licenseFile, outDir);
    }
}

export function copyDefaultTranslationFiles(widgetDir) {
    const outDir = join(widgetDir, "dist/tmp/widgets/");
    copyTranslationFiles(widgetDir, outDir);
}

export function copyTranslationFiles(sourcePath, outDir) {
    const localesDir = join(outDir, "locales/");
    mkdirSync(localesDir, { recursive: true });

    const translationFiles = join(sourcePath, "dist/locales/**/*");
    // copy everything under dist/locales to dist/tmp/widgets/locales for the widget mpk
    cp("-r", translationFiles, localesDir);
    // remove root level *.json locales files (duplicate with language specific files (e.g. en-US/*.json))
    const rootLevelJsonFiles = fg.sync(["locales/*.json"], { cwd: outDir, caseSensitiveMatch: false, absolute: true });
    rm("-f", rootLevelJsonFiles);
}
