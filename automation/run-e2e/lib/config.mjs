export const testsDir = "tests";
export const testProjectDir = "tests/testProject";
export const postUnzipProjectDirGlob = "tests/testProjects-*";
export const mprFileGlob = "tests/testProject/*.mpr";
export const nameForDownloadedArchive = "testProject.zip";
export const nameForDownloadedAtlasCore = "AtlasCore.zip";
export const nameForDownloadedAtlasTheme = "AtlasTheme.zip";
export const atlasCoreReleaseUrl = "https://api.github.com/repos/mendix/atlas/releases";
// Defaults, a package can override them with testProject.atlasCoreVersion and testProject.atlasThemeTag
export const defaultAtlasCoreVersion = "3.17.0";
export const defaultAtlasThemeTag = "atlasui-theme-files-2024-01-25";
export const mxVersionMapUrl =
    "https://raw.githubusercontent.com/mendix/web-widgets/main/automation/run-e2e/mendix-versions.json";
export const tmpDirPrefix = "run_e2e_files_";
export const atlasDirsToRemove = [
    "tests/testProject/themesource/atlas_ui_resources",
    "tests/testProject/themesource/atlas_core",
    "tests/testProject/themesource/atlas_nativemobile_content",
    "tests/testProject/themesource/atlas_web_content",
    "tests/testProject/themesource/datawidgets"
];
