# Security

All security validation is centralized in `src/security/guardrails.ts`:

```typescript
import { validateFilePath, ALLOWED_EXTENSIONS } from "@/security";

// Validates path traversal and extension whitelist
validateFilePath(widgetPath, filePath, true); // true = check extension
```

## Security Measures

| Protection          | Function                  | Description                                                         |
| ------------------- | ------------------------- | ------------------------------------------------------------------- |
| Path Traversal      | `validateFilePath()`      | Blocks `..` sequences and resolved path escapes                     |
| Extension Whitelist | `isExtensionAllowed()`    | Only allows: `.tsx`, `.ts`, `.xml`, `.scss`, `.css`, `.json`, `.md` |
| Directory Boundary  | `isPathWithinDirectory()` | Ensures files stay within widget directory                          |

**Rule**: When adding file operation tools, always use `validateFilePath()` from the security module.
