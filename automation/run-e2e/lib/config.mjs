export const testsDir = "tests";
export const testProjectDir = "tests/testProject";
export const postUnzipProjectDirGlob = "tests/testProjects-*";
export const mprFileGlob = "tests/testProject/*.mpr";
export const nameForDownloadedArchive = "testProject.zip";
export const nameForDownloadedStarterApp = "StarterAppRelease.zip";
export const starterAppLatestReleaseUrl = "https://api.github.com/repos/mendix/StarterApp_Blank/releases/latest";
export const mxVersionMapUrl =
    "https://raw.githubusercontent.com/mendix/web-widgets/main/automation/run-e2e/mendix-versions.json";
export const tmpDirPrefix = "run_e2e_files_";
export const atlasDirsToRemove = [
    "tests/testProject/theme",
    "tests/testProject/themesource/atlas_ui_resources",
    "tests/testProject/themesource/atlas_core",
    "tests/testProject/themesource/atlas_nativemobile_content",
    "tests/testProject/themesource/atlas_web_content",
    "tests/testProject/themesource/datawidgets"
];
