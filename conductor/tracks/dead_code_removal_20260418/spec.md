# Specification: Dead Code Removal

## Overview
This track focuses on removing all 500+ identified dead code items from the codebase. The goal is to improve navigation, decrease build times, and clean up dependency manifests. We will use the Dead Code Removal Manifesto as a baseline, but dynamically remove any other discovered dead code. 

## Delivery Strategy
All changes will be committed to a single branch and delivered in a single PR, though each cleanup phase will be committed separately for easier revert if needed.

## Execution Order
1. Remove unused imports/exports.
2. Remove unused components.
3. Remove unused backend services.
4. Prune unused dependencies from `pom.xml` and `package.json`.

## Acceptance Criteria
- **AC1:** All items listed in the Dead Code Removal Manifesto, plus any dynamically discovered unused code, are deleted from the source.
- **AC2:** `pom.xml` and `package.json` no longer reference any dependencies exclusively used by the removed code.
- **AC3:** Frontend build size (bundle analysis) is measurably smaller than the pre-cleanup baseline.
- **AC4:** All remaining application features pass the existing automated smoke tests and CI pipeline (no manual regression required).
- **AC5:** CI pipeline passes with no new unused-import warnings introduced by the cleanup.

## Out of Scope
- Refactoring existing code logic or changing active features.
- Major dependency upgrades (only pruning unused ones).