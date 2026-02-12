#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Generate dependencies.json and dependencies.txt from package.json using pnpm to get actual installed versions
 *
 * Usage: node generate-dependencies.js [path-to-package.json]
 */

function getPackageJsonPath() {
    const arg = process.argv[2];
    if (arg) {
        return path.resolve(arg);
    }
    // Default to package.json in current directory
    return path.resolve(process.cwd(), "package.json");
}

function readPackageJson(packageJsonPath) {
    if (!fs.existsSync(packageJsonPath)) {
        console.error(`Error: package.json not found at ${packageJsonPath}`);
        process.exit(1);
    }

    try {
        const content = fs.readFileSync(packageJsonPath, "utf8");
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading or parsing package.json: ${error.message}`);
        process.exit(1);
    }
}

function getInstalledVersion(packageName, packageDir) {
    try {
        // Use pnpm list to get the actual installed version
        // --depth 0 to only show direct dependencies
        // --json for parseable output
        const output = execSync(`pnpm list "${packageName}" --depth 0 --json`, {
            cwd: packageDir,
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"]
        });

        const result = JSON.parse(output);

        // pnpm list returns an array of project results
        if (Array.isArray(result) && result.length > 0) {
            const dependencies = result[0].dependencies || {};
            if (dependencies[packageName]) {
                const version = dependencies[packageName].version;
                // Remove any leading 'v' if present
                return version.replace(/^v/, "");
            }
        }

        return null;
    } catch (error) {
        // If pnpm list fails, try reading from node_modules
        try {
            const nodeModulesPath = path.join(packageDir, "node_modules", packageName, "package.json");
            if (fs.existsSync(nodeModulesPath)) {
                const pkgContent = JSON.parse(fs.readFileSync(nodeModulesPath, "utf8"));
                return pkgContent.version;
            }
        } catch (innerError) {
            // Ignore
        }

        console.warn(`Warning: Could not determine installed version for ${packageName}`);
        return null;
    }
}

function getPackageMetadata(packageName, version) {
    try {
        // Use pnpm view to get package metadata from npm registry
        const output = execSync(`pnpm view "${packageName}@${version}" --json`, {
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"]
        });

        const metadata = JSON.parse(output);

        return {
            name: metadata.name || packageName,
            version: metadata.version || version,
            license: metadata.license || "UNKNOWN",
            private: metadata.private || false,
            description: metadata.description || "",
            repository: formatRepository(metadata.repository),
            author: metadata.author || "",
            homepage: metadata.homepage || ""
        };
    } catch (error) {
        console.warn(`Warning: Could not fetch metadata for ${packageName}@${version}`);
        return {
            name: packageName,
            version: version,
            license: "UNKNOWN",
            private: false,
            description: "",
            repository: "",
            author: "",
            homepage: ""
        };
    }
}

function formatRepository(repo) {
    if (!repo) return "undefined";
    if (typeof repo === "string") return repo;
    if (repo.url) return repo.url;
    return "undefined";
}

function getLicenseText(packageName, version, packageDir) {
    // Try to find LICENSE file in node_modules
    const possiblePaths = [
        path.join(packageDir, "node_modules", packageName, "LICENSE"),
        path.join(packageDir, "node_modules", packageName, "LICENSE.md"),
        path.join(packageDir, "node_modules", packageName, "LICENSE.txt"),
        path.join(packageDir, "node_modules", packageName, "license"),
        path.join(packageDir, "node_modules", packageName, "license.md"),
        path.join(packageDir, "node_modules", packageName, "license.txt")
    ];

    for (const licensePath of possiblePaths) {
        if (fs.existsSync(licensePath)) {
            try {
                return fs.readFileSync(licensePath, "utf8").trim();
            } catch (error) {
                // Continue to next path
            }
        }
    }

    // If not found in node_modules, try pnpm's virtual store
    const pnpmStorePath = path.join(
        packageDir,
        "..",
        "..",
        "node_modules",
        ".pnpm",
        `${packageName}@${version}`,
        "node_modules",
        packageName
    );

    for (const filename of ["LICENSE", "LICENSE.md", "LICENSE.txt", "license", "license.md", "license.txt"]) {
        const licensePath = path.join(pnpmStorePath, filename);
        if (fs.existsSync(licensePath)) {
            try {
                return fs.readFileSync(licensePath, "utf8").trim();
            } catch (error) {
                // Continue
            }
        }
    }

    return null;
}

function generateDependenciesJson(packageJsonPath) {
    const packageJson = readPackageJson(packageJsonPath);
    const packageDir = path.dirname(packageJsonPath);

    const dependencies = packageJson.dependencies || {};
    const dependencyNames = Object.keys(dependencies);

    if (dependencyNames.length === 0) {
        console.log("No dependencies found in package.json");
        return { jsonData: [], detailedData: [] };
    }

    console.log(`Found ${dependencyNames.length} dependencies, resolving versions...`);

    const jsonData = [];
    const detailedData = [];

    for (const depName of dependencyNames) {
        const version = getInstalledVersion(depName, packageDir);

        if (version) {
            // Add to JSON format
            jsonData.push({
                [depName]: {
                    version: version,
                    url: null
                }
            });

            // Fetch metadata for TXT format
            const metadata = getPackageMetadata(depName, version);
            const licenseText = getLicenseText(depName, version, packageDir);

            detailedData.push({
                ...metadata,
                licenseText
            });

            console.log(`  ✓ ${depName}@${version}`);
        } else {
            console.warn(`  ✗ ${depName} - version not found`);
        }
    }

    return { jsonData, detailedData };
}

function generateDependenciesTxt(detailedData) {
    const sections = [];

    for (const dep of detailedData) {
        const lines = [];

        lines.push(`Name: ${dep.name}`);
        lines.push(`Version: ${dep.version}`);
        lines.push(`License: ${dep.license}`);
        lines.push(`Private: ${dep.private}`);
        lines.push(`Description: ${dep.description}`);
        lines.push(`Repository: ${dep.repository}`);

        if (dep.author) {
            lines.push(`Author: ${dep.author}`);
        }

        if (dep.homepage) {
            lines.push(`Homepage: ${dep.homepage}`);
        }

        if (dep.licenseText) {
            lines.push("License Copyright:");
            lines.push("===");
            lines.push("");
            lines.push(dep.licenseText);
        }

        sections.push(lines.join("\n"));
    }

    return sections.join("\n\n---\n\n");
}

function main() {
    const packageJsonPath = getPackageJsonPath();
    const jsonOutputPath = path.join(process.cwd(), "dependencies.json");
    const txtOutputPath = path.join(process.cwd(), "dependencies.txt");

    console.log(`Reading package.json from: ${packageJsonPath}`);

    const { jsonData, detailedData } = generateDependenciesJson(packageJsonPath);

    // Write dependencies.json
    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonData));
    console.log(`\n✓ Generated dependencies.json at: ${jsonOutputPath}`);
    console.log(`  Total dependencies: ${jsonData.length}`);

    // Write dependencies.txt
    const txtContent = generateDependenciesTxt(detailedData);
    fs.writeFileSync(txtOutputPath, txtContent + "\n");
    console.log(`✓ Generated dependencies.txt at: ${txtOutputPath}`);
}

main();
