# Search Language Cheat Sheet

This is a companion note for the app-building primer.

## Useful Terms

- Live search filtering: the list updates while the user types.
- Typeahead filtering: another name for live search that responds as the user types.
- Contains match: the typed text can appear anywhere in the item. Typing `fri` shows `Fries`.
- Starts-with match: the item must begin with the typed text. Typing `fr` shows `Fries`, but `ies` does not.
- Exact match: the typed text must match the whole item exactly.
- Fuzzy search: slightly wrong typing can still return likely matches. Typing `frs` could show `Fries`.
- Token search: multi-word searches can match words in any order. Typing `boats paper` could show `Paper boats`.
- Ranked search: results are sorted by relevance, such as starts-with matches first, then contains matches.
- Debounced search: the app waits briefly after typing before filtering, useful for very large lists.

## Best Phrase For Truck Notes

Use this when describing the desired behavior:

> I want live typeahead search using contains, fuzzy, and token matching, with ranked results and starred items prioritized.

That means the list responds immediately as the user types, matching text anywhere in the item name, tolerating small typos, matching multi-word items in flexible word order, and keeping starred/favorite items prioritized.

## Truck Notes Search Rule

Inventory and Supplies should use:

- Contains match
- Fuzzy match
- Token match
- Ranked results
- Starred items prioritized
- The main item list should respond directly
- No separate suggestion tray unless the list itself cannot carry the interaction

## Truck Notes Feedback Rule

When a small control changes state, prefer quiet local feedback before adding a toast or modal.

First suggestion:

- Tiny pop on the tapped control
- Soft pulse on the affected row/card
- No toast for repeatable setup actions

Use this especially for star/favorite toggles, lightweight selection states, and other repeated configuration taps.
