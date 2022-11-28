import { fileURLToPath } from "node:url";

export const relativeToModule = (path, baseUrl) => fileURLToPath(new URL(path, baseUrl));
