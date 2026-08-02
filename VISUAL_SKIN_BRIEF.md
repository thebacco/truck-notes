# Truck Notes Visual Skin Brief

This brief is for an agent doing a visual appearance pass on Truck Notes.

## Goal

Create an alternate visual skin for Truck Notes that explores a more polished
surface/material treatment. The goal is to see what the app could look like with
a different visual design sensibility while preserving the working product.

Think of this as reskinning the app, not rebuilding it.

## Scope

Allowed:

- Card, panel, and app surface colors.
- Surface materials, subtle texture, gradients, and depth.
- Border color/opacity.
- Shadow treatment, as long as it respects the existing 8px card radius and
  does not create hard rectangular bands.
- Input, row, and button visual styling.
- Icon color/stroke presentation if needed for visual consistency.
- Light/dark mode visual polish.

Not allowed:

- Changing workflow logic.
- Changing saved state shape.
- Changing authentication, sender/operator behavior, notes behavior, inventory
  behavior, supplies behavior, closeout behavior, or report/text behavior.
- Changing carousel order.
- Changing scroll physics.
- Changing swipe thresholds, gesture ownership, animation cadence, or promotion
  queue behavior.
- Changing list heights, partial-item reveal proportions, or scroll runway.
- Adding frameworks, dependencies, build steps, or external assets unless the
  user explicitly approves.
- Refactoring unrelated code.

## Existing Product Rules To Preserve

- Mobile-first PWA.
- Native scroll and native iOS overscroll bounce should remain the default.
- Scrollable lists use soft fades and partial-item reveal as the primary scroll
  affordance.
- Supplies and Inventory have internal scroll lists inside fixed cards, plus
  outer scroll runway matching the other tabs.
- Notes, Staff, Closeout, Supplies, and Inventory use the same outer scroll
  runway.
- Header, subnav carousel, content carousel, and footer must remain in their
  current layout roles.
- Bottom footer must remain reachable and not clipped by phone corners.
- The app should still feel like an operational staff tool, not a marketing page.

## Current Visual Concerns

The app works well, but some surfaces still read as a little HTML/CSS-boxy.
The desired experiment is to make the UI feel more like finished mobile
software:

- Less flat single-color paneling.
- Less obvious "box drawn with border" feel.
- More material quality in cards and rows.
- Better visual separation without heavy outlines everywhere.
- Shadows should feel attached to rounded surfaces, not rectangular straight
  lines between cards.
- Texture can be explored, but it must be subtle and not decorative clutter.

## Typography

Preserve the current typographic logic:

- Voltage: Miss Tasty brand mark.
- Centrifuge: compact headings, section labels, button/action labels.
- Univers: user-entered data, selected values, names, quantities, readable
  operational content.

Do not replace the type system during this visual skin experiment.

## Good First Pass

A good first pass would:

1. Define a cleaner set of surface variables in CSS.
2. Apply those variables consistently to major panels/cards.
3. Reduce harsh borders where surface depth can carry separation.
4. Use rounded-surface-aware shadows that do not create straight bands.
5. Add optional micro-texture or very soft material variation if it genuinely
   improves the surface.
6. Verify light mode first, then make dark mode coherent.
7. Run the existing build check.
8. Preview on the phone frame/mobile viewport before handing back.

## Evaluation Standard

The experiment succeeds if the app feels more polished without anyone needing
to relearn it.

If a styling idea requires changing behavior, layout structure, or interaction
physics, skip it and note it as a separate future proposal.
