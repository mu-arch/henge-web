---
title: How we're focusing on performance in Henge
date: 2026-10-08
type: dev-diary
excerpt: Why we test Henge on old machines, and how we're preparing it for tablets.
---

Efficiency shapes Henge from the start. The same C89 core runs our software renderer in a browser and on Windows 3.1 hardware. We profile where each frame's time goes on real period machines, with a target of 15 frames per second on a Cyrix MediaGX. Heavier scenes still fall short of that mark, which gives us specific work to do.

Some of the gains come from small decisions: redraw only the parts of the interface that changed, reuse a character's mesh while its pose stays the same, and draw distant terrain with less detail. The point is to make room for a larger world without treating newer hardware as the answer to every performance problem.

Tablets are part of the same thinking. Henge's browser client already handles taps, press-and-hold action menus, dragging, pinch zoom, and on-screen text entry. We want to make those foundations feel at home on a tablet, with readable layouts, comfortable touch targets, and frame pacing tested on real devices. Our aim is to give tablet players the full world, with controls and performance suited to the screen in their hands.
