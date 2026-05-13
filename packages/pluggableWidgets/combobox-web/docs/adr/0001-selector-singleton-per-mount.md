# ADR-0001: Selector is a singleton per widget mount

## Status

Accepted

## Context

The Selector holds the current value, OptionsProvider, CaptionsProvider, and all associated state. It needs to stay in sync with Mendix props on every render.

Two approaches were possible:

1. Recreate the Selector on every render (or on prop changes)
2. Create once via `useRef`, call `updateProps()` each render to sync props

## Decision

The Selector is created once via `useRef` and kept alive for the full widget lifecycle. Each render calls `selector.updateProps(props)` to push new Mendix prop values into the existing instance.

## Consequences

- Selector identity is stable — no re-initialization cost on re-renders
- Internal state (e.g. open/closed, filter input, lazy load offset) survives prop updates
- `updateProps()` must be called on every render or the Selector will hold stale Mendix values
- Adding new props requires updating `updateProps()` in every affected Selector class

## Note

This pattern evolved organically rather than being a deliberate upfront decision. Future work should consider whether explicit prop diffing inside `updateProps()` is needed to avoid unnecessary downstream updates.
