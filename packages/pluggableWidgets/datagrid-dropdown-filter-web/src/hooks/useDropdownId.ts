import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { useState } from "react";

export function useDropdownId(): string {
    const [id] = useState(`DropdownFilter${generateUUID()}`);
    return id;
}
