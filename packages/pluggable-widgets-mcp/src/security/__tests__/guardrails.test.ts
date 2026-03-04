import { describe, expect, it } from "vitest";
import { isExtensionAllowed, isPathWithinDirectory, validateFilePath } from "@/security/guardrails";

describe("isPathWithinDirectory", () => {
    it("returns true for a path within the base directory", () => {
        expect(isPathWithinDirectory("/widgets/foo", "src/Bar.tsx")).toBe(true);
    });

    it("returns true for a nested path within the base directory", () => {
        expect(isPathWithinDirectory("/widgets/foo", "src/components/deep/Bar.tsx")).toBe(true);
    });

    it("returns false for .. traversal escaping the base", () => {
        expect(isPathWithinDirectory("/widgets/foo", "../../../etc/passwd")).toBe(false);
    });

    it("returns false for a sibling directory (foobar vs foo)", () => {
        // /widgets/foobar is NOT within /widgets/foo (prefix attack)
        expect(isPathWithinDirectory("/widgets/foo", "../foobar/secret.txt")).toBe(false);
    });
});

describe("isExtensionAllowed", () => {
    it.each([".tsx", ".ts", ".xml", ".scss", ".json"])("allows %s extension", ext => {
        expect(isExtensionAllowed(`Component${ext}`)).toBe(true);
    });

    it.each([".exe", ".sh"])("rejects %s extension", ext => {
        expect(isExtensionAllowed(`script${ext}`)).toBe(false);
    });

    it("allows .gitignore (dot-file in allowlist)", () => {
        expect(isExtensionAllowed(".gitignore")).toBe(true);
    });

    it("allows extensionless config files like tsconfig", () => {
        expect(isExtensionAllowed("tsconfig")).toBe(true);
    });
});

describe("validateFilePath", () => {
    it("does not throw for a valid path without extension check", () => {
        expect(() => validateFilePath("/widgets/foo", "src/Bar.tsx")).not.toThrow();
    });

    it("throws for .. in the path", () => {
        expect(() => validateFilePath("/widgets/foo", "../secret.txt")).toThrow("Path traversal");
    });

    it("throws for disallowed extension when checkExtension is true", () => {
        expect(() => validateFilePath("/widgets/foo", "src/script.exe", true)).toThrow("extension not allowed");
    });
});
