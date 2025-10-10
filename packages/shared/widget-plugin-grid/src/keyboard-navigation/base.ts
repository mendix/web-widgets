import { FocusEvent, KeyboardEvent, MouseEvent } from "react";
export type TargetEvent =
    | {
          type: "Mouse";
          reactEvent: MouseEvent;
      }
    | {
          type: "Keyboard";
          reactEvent: KeyboardEvent;
      }
    | {
          type: "Focus";
          reactEvent: FocusEvent;
      };

export type FocusTargetFx = (event: TargetEvent) => void;
