import { createElement, ReactElement } from "react";

export default function CalendarIcon(): ReactElement {
    return (
        <svg className="button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path
                fill="currentColor"
                d="M27,5h-3V3h-4v2H12V3h-4v2h-3c-.55,0-1,.45-1,1V28c0,.55,.45,1,1,1H27c.55,0,1-.45,1-1V6c0-.55-.45-1-1-1ZM12,23h-4v-2h4v2Zm0-5h-4v-2h4v2Zm6,5h-4v-2h4v2Zm0-5h-4v-2h4v2Zm6,0h-4v-2h4v2Zm0-5H8v-2H24v2Z"
            />
        </svg>
    );
}
