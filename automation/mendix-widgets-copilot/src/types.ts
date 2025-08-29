export interface PackageInfo {
    name: string;
    path: string;
    kind: "pluggableWidget" | "customWidget" | "module";
    version: string;
    mpkName?: string;
    scripts: Record<string, string>;
    dependencies: string[];
}

export interface WidgetInspection {
    packageInfo: PackageInfo;
    widgetXml?: any;
    packageXml?: any;
    editorConfig?: string;
    runtimeFiles: string[];
    testFiles: string[];
    errors: string[];
}

export interface BuildResult {
    success: boolean;
    command?: string;
    stdout?: string;
    stderr?: string | null;
    error?: string;
    destinationPath?: string;
    destinationInfo?: string;
}

export interface TestResult {
    success: boolean;
    command?: string;
    stdout?: string;
    stderr?: string | null;
    error?: string;
}

export interface VerificationResult {
    success: boolean;
    message?: string;
    version?: string;
    error?: string;
}

export interface TranslationResult {
    success: boolean;
    command?: string;
    stdout?: string;
    stderr?: string | null;
    error?: string;
}

export interface PropertyDefinition {
    key: string;
    type: "text" | "boolean" | "integer" | "enumeration" | "expression" | "action" | "attribute";
    caption: string;
    description: string;
    defaultValue?: string | boolean | number;
    required?: boolean;
    enumValues?: string[];
    attributeTypes?: string[];
    category?: string;
}

export interface DiffPreviewResult {
    success: boolean;
    preview?: string;
    summary?: {
        filesChanged: number;
        linesAdded: number;
        linesRemoved: number;
        description: string;
    };
    changes?: Array<{
        filePath: string;
        operation: "create" | "update" | "delete";
        description: string;
    }>;
    error?: string;
    code?: string;
}

export interface ApplyChangesResult {
    success: boolean;
    appliedChanges?: string[];
    errors?: string[];
    rollbackToken?: string;
    dryRun?: boolean;
    error?: string;
    code?: string;
}
