export type TargetEvent =
    | {
          type: "Mouse";
          reactEvent: React.MouseEvent;
      }
    | {
          type: "Keyboard";
          reactEvent: React.KeyboardEvent;
      }
    | {
          type: "Focus";
          reactEvent: React.FocusEvent;
      };
