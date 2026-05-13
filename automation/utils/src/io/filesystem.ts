import { access, readdir, readFile, writeFile } from "fs/promises";

/**
 * Abstraction layer for filesystem operations
 * Allows for testing and alternative implementations (e.g., MCP, in-memory)
 */
export interface FileSystem {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    readdir(path: string): Promise<string[]>;
}

/**
 * Default Node.js filesystem implementation
 */
export class NodeFileSystem implements FileSystem {
    async readFile(path: string): Promise<string> {
        return readFile(path, "utf-8");
    }

    async writeFile(path: string, content: string): Promise<void> {
        await writeFile(path, content, "utf-8");
    }

    async exists(path: string): Promise<boolean> {
        try {
            await access(path);
            return true;
        } catch {
            return false;
        }
    }

    async readdir(path: string): Promise<string[]> {
        return readdir(path);
    }
}

/**
 * Default filesystem instance for convenience
 */
export const defaultFS = new NodeFileSystem();
