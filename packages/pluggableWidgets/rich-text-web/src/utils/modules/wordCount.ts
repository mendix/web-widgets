// import Quill from "quill";
// import {Module} from "quill/core/module";

// class WordCount extends Module {
//     constructor(quill: Quill, options: Record<string, never>) {
//         super(quill, options);
//     }
//     //   this.quill = quill;
//     //   this.options = options;
//     //   this.container = document.querySelector(options.container);
//     //   quill.on('text-change', this.update.bind(this));
//     //   this.update();  // Account for initial contents
//     // }

//     calculate() {
//      // @ts-expect-error type mismatch expected
//       let text = this.quill.getText();
//       // @ts-expect-error type mismatch expected
//       if (this.options.unit === 'word') {
//         text = text.trim();
//         // Splitting empty text returns a non-empty array
//         return text.length > 0 ? text.split(/\s+/).length : 0;
//       } else {
//         return text.length;
//       }
//     }

//     update() {
//       var length = this.calculate();
//       var label = this.options.unit;
//       if (length !== 1) {
//         label += 's';
//       }
//       this.container.innerText = length + ' ' + label;
//     }
//   }

//   Quill.register('modules/counter', Counter);
