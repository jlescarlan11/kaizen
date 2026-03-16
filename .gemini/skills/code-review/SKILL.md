---
name: code-review
description: Perform a comprehensive code review of recent changes, focusing on security, performance, and adherence to project-specific standards. Use when asked to review code, check a PR, or analyze the impact of recent modifications.
---

# Code Review

## Overview

Analyze code changes for potential bugs, security vulnerabilities, performance regressions, and alignment with the `CODING_STANDARDS.md`.

## Workflow

### 1. Identify Target Changes
- If a specific branch, commit, or file list is provided, use that.
- Otherwise, check for staged changes using `git diff --cached`.
- If no staged changes, check the last commit with `git show HEAD`.
- If both are empty, ask the user to specify what to review.

### 2. Gather Context
- Read the full content of any modified files, not just the diff. The diff alone often lacks the context needed to spot subtle logic errors or architectural mismatches.
- Locate and read any relevant tests or documentation associated with the changes.

### 3. Analyze Against Standards
Systematically evaluate the changes using the following criteria:

#### Global Principles
- **Clarity**: Is the code easy to read and understand?
- **Small Units**: Are functions and classes focused on a single responsibility?
- **Error Handling**: Are errors handled explicitly and logged with context? No swallowed errors.
- **Security**: Is input validated? Are secrets protected?

#### Frontend (TypeScript/React/Tailwind)
- **Typing**: Is strict mode respected? No `any` without strong justification.
- **React Patterns**: Pure components, proper `useEffect` usage, separation of server vs. UI state.
- **Typography**: Adhere strictly to Section 1.7.1 of `CODING_STANDARDS.md`. Verify Tailwind roles (`display`, `h1`, `h2`, etc.) and semantic tokens.
- **Accessibility**: Verify WCAG AAA targets and proper contrast for filled surfaces.
- **Form Fields**: Check Section 1.7.2 for styling, validation timing, and ARIA attributes.

#### Backend (Java/Spring Boot)
- **Layering**: Ensure proper separation between Controller, Service, and Repository.
- **DTOs**: Ensure entities are not leaked to the Controller layer.
- **Transactions**: Verify `@Transactional` usage at the service layer for atomic operations.
- **Persistence**: Check for EAGER fetching or potential N+1 query issues.

#### Performance & Algorithms
- **Complexity**: Identify Big-O time and space complexity for non-trivial logic.
- **Optimization**: Avoid O(n^2) pitfalls (e.g., searching an array inside a loop).

### 4. Provide Feedback
Deliver a structured review:
- **Summary**: High-level overview of the changes and their impact.
- **Critical Issues**: Bugs, security holes, or breaking changes.
- **Standards Deviations**: Specific mentions of `CODING_STANDARDS.md` violations.
- **Suggestions**: Refactoring opportunities, performance improvements, or better idiomatic patterns.
- **Positive Feedback**: Acknowledge well-written code or clever (but clear) solutions.

## Examples

- "Review my staged changes."
- "Can you do a code review of the last 2 commits?"
- "Check `frontend/src/features/auth/AuthPage.tsx` for any standards violations."
