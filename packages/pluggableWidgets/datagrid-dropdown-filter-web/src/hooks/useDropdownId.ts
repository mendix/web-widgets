import { generateUUID } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { useState } from "react";

export function useDropdownId(): string {
    const [id] = useState(`DropdownFilter${generateUUID()}`);
    return id;
}
