## 1. Update SCSS for list style cycling

- [x] 1.1 Add nested selector rules for ordered lists (ol) with 6 levels: decimal → lower-alpha → lower-roman → decimal → lower-alpha → lower-roman
- [x] 1.2 Add nested selector rules for unordered lists (ul) with 6 levels: disc → circle → square → disc → circle → square
- [x] 1.3 Preserve existing padding-left and margin rules for ul/ol

## 2. Manual testing

- [x] 2.1 Test ordered list nesting: verify 6 levels show correct cycle (1 → a → i → 1 → a → i)
- [x] 2.2 Test unordered list nesting: verify 4 levels show correct cycle (● → ○ → ■ → ●)
- [x] 2.3 Test mixed list types: ordered inside unordered starts at decimal, unordered inside ordered starts at disc
- [x] 2.4 Test inline style override: list with style="list-style-type: upper-roman;" displays upper-roman at any depth
- [x] 2.5 Test task lists remain unaffected: ul[data-type="taskList"] shows no bullets/numbers

## 3. Documentation

- [x] 3.1 Add entry to CHANGELOG.md describing auto-cycle enhancement
