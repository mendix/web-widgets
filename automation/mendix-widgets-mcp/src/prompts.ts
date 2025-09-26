import { z } from "zod";

/**
 * Prompt templates for common widget development workflows
 * These provide structured, guided interactions for complex tasks
 */

// Define the handler type based on what MCP expects
type PromptHandler = (args: any) =>
    | Promise<{
          messages: Array<{
              role: "user" | "assistant";
              content: {
                  type: "text";
                  text: string;
              };
          }>;
      }>
    | {
          messages: Array<{
              role: "user" | "assistant";
              content: {
                  type: "text";
                  text: string;
              };
          }>;
      };

export interface PromptDefinition {
    name: string;
    title: string;
    description: string;
    arguments: Array<{
        name: string;
        description: string;
        required?: boolean;
        schema?: z.ZodType<any>;
    }>;
    handler: PromptHandler;
}

/**
 * Add Property to Widget Prompt
 * Guides through the complete process of adding a new property
 */
export const addPropertyPrompt: PromptDefinition = {
    name: "add-widget-property",
    title: "Add Property to Widget",
    description: "Guided workflow for adding a new property to a Mendix widget with full integration",
    arguments: [
        {
            name: "widgetName",
            description: "Name of the widget (e.g., 'switch-web', 'gallery-web')",
            required: true,
            schema: z.string()
        },
        {
            name: "propertyType",
            description: "Type of property (text, boolean, integer, enumeration, expression, action, attribute)",
            required: true,
            schema: z.enum(["text", "boolean", "integer", "enumeration", "expression", "action", "attribute"])
        },
        {
            name: "propertyKey",
            description: "Property identifier/key (e.g., 'label', 'isDisabled')",
            required: false,
            schema: z.string()
        }
    ],
    handler: async ({ widgetName, propertyType, propertyKey }) => {
        const key = propertyKey || `new${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}Property`;

        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `I need to add a new ${propertyType} property to the ${widgetName} widget.

Here are the requirements:
- Widget: ${widgetName}
- Property type: ${propertyType}
- Property key: ${key}

Please guide me through this process:
1. First, inspect the current widget structure to understand existing properties
2. Show me the current properties and suggest where this new property should fit
3. Help me define the property with appropriate caption, description, and default value
4. Preview the changes before applying them
5. Apply the changes if they look good
6. Regenerate TypeScript typings after the changes

Let's start by examining the widget's current state.`
                    }
                }
            ]
        };
    }
};

/**
 * Build and Deploy Widget Prompt
 * Complete workflow for building and deploying a widget
 */
export const buildDeployPrompt: PromptDefinition = {
    name: "build-deploy-widget",
    title: "Build and Deploy Widget",
    description: "Complete workflow for building a widget and deploying it to a Mendix project",
    arguments: [
        {
            name: "widgetName",
            description: "Name of the widget to build",
            required: true,
            schema: z.string()
        },
        {
            name: "targetProject",
            description: "Path to target Mendix project (optional)",
            required: false,
            schema: z.string()
        },
        {
            name: "runTests",
            description: "Whether to run tests before building",
            required: false,
            schema: z.boolean()
        }
    ],
    handler: async ({ widgetName, targetProject, runTests = true }) => {
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `I want to build and deploy the ${widgetName} widget${targetProject ? ` to ${targetProject}` : ""}.

Workflow steps:
${runTests ? "1. Run unit tests to ensure the widget is working correctly\n" : ""}${runTests ? "2. " : "1. "}Verify manifest versions are in sync
${runTests ? "3. " : "2. "}Build the widget
${runTests ? "4. " : "3. "}${targetProject ? `Deploy the MPK to ${targetProject}` : "Copy the MPK to the default test project"}
${runTests ? "5. " : "4. "}Provide instructions for synchronizing in Studio Pro

Please execute this workflow step by step, showing me the output of each step.`
                    }
                }
            ]
        };
    }
};

/**
 * Debug Widget Issue Prompt
 * Helps diagnose and fix widget issues
 */
export const debugWidgetPrompt: PromptDefinition = {
    name: "debug-widget-issue",
    title: "Debug Widget Issue",
    description: "Systematic approach to debugging widget issues",
    arguments: [
        {
            name: "widgetName",
            description: "Name of the widget having issues",
            required: true,
            schema: z.string()
        },
        {
            name: "issueType",
            description: "Type of issue (build, runtime, property, styling)",
            required: true,
            schema: z.enum(["build", "runtime", "property", "styling", "other"])
        },
        {
            name: "errorMessage",
            description: "Any error message you're seeing",
            required: false,
            schema: z.string()
        }
    ],
    handler: async ({ widgetName, issueType, errorMessage }) => {
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `I'm experiencing a ${issueType} issue with the ${widgetName} widget.
${errorMessage ? `\nError message: ${errorMessage}\n` : ""}
Please help me debug this issue systematically:

1. Inspect the widget structure and configuration
2. Check for common ${issueType} issues:
${issueType === "build" ? "   - Package.json scripts and dependencies\n   - TypeScript compilation errors\n   - Missing or misconfigured build tools" : ""}
${issueType === "runtime" ? "   - Console errors in the browser\n   - Property binding issues\n   - React component lifecycle problems" : ""}
${issueType === "property" ? "   - Property definitions in Widget XML\n   - TypeScript type definitions\n   - Property usage in the runtime component" : ""}
${issueType === "styling" ? "   - SCSS compilation issues\n   - CSS class conflicts\n   - Missing style imports" : ""}
3. Suggest potential fixes
4. Help me implement the solution

Let's start by examining the widget.`
                    }
                }
            ]
        };
    }
};

/**
 * Rename Property Across Widget Prompt
 * Comprehensive property renaming workflow
 */
export const renamePropertyPrompt: PromptDefinition = {
    name: "rename-widget-property",
    title: "Rename Widget Property",
    description: "Safely rename a property across all widget files",
    arguments: [
        {
            name: "widgetName",
            description: "Name of the widget",
            required: true,
            schema: z.string()
        },
        {
            name: "oldPropertyName",
            description: "Current name of the property",
            required: true,
            schema: z.string()
        },
        {
            name: "newPropertyName",
            description: "New name for the property",
            required: true,
            schema: z.string()
        }
    ],
    handler: async ({ widgetName, oldPropertyName, newPropertyName }) => {
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `I need to rename the property "${oldPropertyName}" to "${newPropertyName}" in the ${widgetName} widget.

Please help me with this refactoring:

1. First, verify that the property "${oldPropertyName}" exists in the widget
2. Check all files where this property is referenced:
   - Widget XML manifest
   - TypeScript interfaces and types
   - Runtime component implementation
   - Editor configuration
   - Any test files
3. Show me a preview of all the changes that will be made
4. Apply the changes if they look correct
5. Regenerate TypeScript typings
6. Run tests to ensure nothing broke

Let's start by confirming the property exists and seeing where it's used.`
                    }
                }
            ]
        };
    }
};

/**
 * Create New Widget From Template Prompt
 * Scaffolds a new widget based on an existing one
 */
export const createWidgetPrompt: PromptDefinition = {
    name: "create-widget-from-template",
    title: "Create New Widget from Template",
    description: "Create a new widget based on an existing widget as a template",
    arguments: [
        {
            name: "newWidgetName",
            description: "Name for the new widget",
            required: true,
            schema: z.string()
        },
        {
            name: "templateWidget",
            description: "Existing widget to use as template",
            required: true,
            schema: z.string()
        },
        {
            name: "widgetDescription",
            description: "Description of what the new widget will do",
            required: false,
            schema: z.string()
        }
    ],
    handler: async ({ newWidgetName, templateWidget, widgetDescription }) => {
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `I want to create a new widget called "${newWidgetName}" based on the ${templateWidget} widget as a template.
${widgetDescription ? `\nWidget description: ${widgetDescription}\n` : ""}
Please guide me through this process:

1. First, analyze the structure of ${templateWidget} to understand what we're copying
2. Create a new widget directory structure for ${newWidgetName}
3. Copy and adapt the necessary files:
   - Update package.json with new widget information
   - Modify the Widget XML manifest
   - Update TypeScript files with new widget name
   - Adjust the main component implementation
4. Set up the build configuration
5. Initialize the widget with a basic test
6. Provide next steps for customization

Note: This is a manual scaffolding process. In the future, we might want to use the official Yeoman generator.

Let's start by examining the template widget structure.`
                    }
                }
            ]
        };
    }
};

/**
 * Widget Performance Analysis Prompt
 * Analyzes and optimizes widget performance
 */
export const performanceAnalysisPrompt: PromptDefinition = {
    name: "analyze-widget-performance",
    title: "Analyze Widget Performance",
    description: "Analyze and optimize widget performance issues",
    arguments: [
        {
            name: "widgetName",
            description: "Name of the widget to analyze",
            required: true,
            schema: z.string()
        },
        {
            name: "specificConcern",
            description: "Specific performance concern (rendering, data-fetching, memory)",
            required: false,
            schema: z.enum(["rendering", "data-fetching", "memory", "bundle-size"])
        }
    ],
    handler: async ({ widgetName, specificConcern }) => {
        const concerns = specificConcern ? ` with focus on ${specificConcern} issues` : "";

        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `I need to analyze and optimize the performance of the ${widgetName} widget${concerns}.

Performance analysis checklist:

1. **Bundle Size Analysis**:
   - Check widget dependencies and their sizes
   - Identify any unnecessary or duplicate dependencies
   - Look for opportunities to use lighter alternatives

2. **Runtime Performance**:
   - Analyze React component render cycles
   - Check for unnecessary re-renders
   - Review hooks usage and dependencies
   - Identify any performance anti-patterns

3. **Data Handling**:
   - Review how the widget fetches and processes data
   - Check for inefficient data transformations
   - Look for opportunities to memoize expensive computations

4. **Code Quality**:
   - Check for memory leaks
   - Review event listener cleanup
   - Analyze subscription management

Please analyze the widget and provide specific recommendations for improvement.`
                    }
                }
            ]
        };
    }
};

/**
 * Migrate Widget Version Prompt
 * Helps with widget version migrations
 */
export const migrateWidgetPrompt: PromptDefinition = {
    name: "migrate-widget-version",
    title: "Migrate Widget Version",
    description: "Guide through widget version migration and dependency updates",
    arguments: [
        {
            name: "widgetName",
            description: "Name of the widget to migrate",
            required: true,
            schema: z.string()
        },
        {
            name: "targetMendixVersion",
            description: "Target Mendix version (e.g., '10.0.0', '9.24.0')",
            required: false,
            schema: z.string()
        }
    ],
    handler: async ({ widgetName, targetMendixVersion }) => {
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `I need to migrate the ${widgetName} widget${targetMendixVersion ? ` to be compatible with Mendix ${targetMendixVersion}` : " to a newer version"}.

Migration checklist:

1. **Dependency Analysis**:
   - Check current dependencies and their versions
   - Identify outdated or deprecated packages
   - Review Mendix SDK version compatibility

2. **Breaking Changes**:
   - Review widget API changes
   - Check for deprecated property types
   - Identify required XML schema updates

3. **Testing Strategy**:
   - Run existing tests to establish baseline
   - Update tests for new version requirements
   - Add migration-specific tests

4. **Migration Steps**:
   - Update package.json dependencies
   - Modify widget XML if needed
   - Update TypeScript configurations
   - Adjust runtime implementation for API changes
   - Regenerate typings

Please guide me through this migration process step by step.`
                    }
                }
            ]
        };
    }
};

/**
 * Collection of all available prompts
 */
export const prompts: PromptDefinition[] = [
    addPropertyPrompt,
    buildDeployPrompt,
    debugWidgetPrompt,
    renamePropertyPrompt,
    createWidgetPrompt,
    performanceAnalysisPrompt,
    migrateWidgetPrompt
];

/**
 * Get prompt by name
 */
export function getPrompt(name: string): PromptDefinition | undefined {
    return prompts.find(p => p.name === name);
}

/**
 * List all available prompts
 */
export function listPrompts(): Array<{ name: string; description: string }> {
    return prompts.map(p => ({
        name: p.name,
        description: p.description
    }));
}
