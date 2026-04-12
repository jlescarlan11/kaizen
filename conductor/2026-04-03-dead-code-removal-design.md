---
title: Dead Code Removal Design
date: 2026-04-03
author: Gemini CLI
design_depth: deep
task_complexity: complex
---

# Design: Dead Code Removal

## 1. Problem Statement

The project currently contains over 500 files across its Java backend and TypeScript frontend, accumulating significant technical debt in the form of unused classes, methods, variables, and imports. This 'dead code' increases cognitive load for developers, bloats build times, and complicates maintenance by obscuring the true architecture of the application.

*   **Objective** — To achieve a 'zero-debt' baseline by identifying and removing all technically unused and functionally unreached code across both layers. — *Traces To: REQ-1*
*   **Scope** — Comprehensive cleanup of unused files, exports, methods, variables, and imports. *(considered: Architectural Only — rejected because it misses low-level clutter; Low-Risk Linting — rejected because it doesn't reach the zero-debt goal)* — *Traces To: REQ-2*
*   **Approach** — Automated Audit & Guided Deletion using SonarQube, PMD, and Knip within a single 'cleanup' branch. *(considered: Static Sweep — rejected because it lacks precision for unused files; Dynamic Pruning — rejected because it carries too much risk of false positives)* — *Traces To: REQ-3*

## 2. Requirements

**Functional Requirements**
*   **REQ-1: Comprehensive Cleanup** — The system must identify and remove all unused files, exports, methods, variables, and imports. — *Rationale: Addresses the core technical debt problem.*
*   **REQ-2: Multi-Layer Support** — Both the Java backend (Maven/Spring) and TypeScript frontend (Vite/React) must be audited and cleaned. — *Rationale: Prevents partial cleanup where one layer remains cluttered.*
*   **REQ-3: Automated Audit** — SonarQube, PMD, and Knip must be used to generate a 'Dead Code Manifesto' before any deletions. — *Rationale: Provides a clear source of truth and traceability for all deletions.*
*   **REQ-4: Verification Cycle** — All changes must be verified through existing `mvn verify` and `npm run test:coverage` scripts. — *Rationale: Ensures that no functional logic is broken during the cleanup.*

**Non-Functional Requirements**
*   **REQ-5: Traceability** — Every deletion must be traceable to a specific finding in the audit reports. — *Rationale: Ensures that we can justify every change to the codebase.*
*   **REQ-6: Minimal Risk** — High-risk components (reflection-based entities, dynamic routing) must be handled with care or excluded from automated removal. — *Rationale: Prevents application-breaking changes due to false positives.*
*   **REQ-7: Build Performance** — The cleanup should lead to a measurable improvement (or at least no regression) in build and test execution times. — *Rationale: Quantifies the impact of the dead code removal.*

**Constraints**
*   **CON-1: Single Branch** — All cleanup changes must be committed to a single 'cleanup' branch for final review and merge. — *Rationale: Simplifies the merge process and provides a clear 'before and after' view.*
*   **CON-2: Existing Infrastructure** — No new CI/CD pipelines or servers should be required beyond current project tools. — *Rationale: Minimizes the impact on the existing development workflow.*

## 3. Approach

**Selected Approach: Automated Audit & Guided Deletion**
*   **Audit Phase** — Generation of a 'Dead Code Manifesto' using SonarQube, PMD, and Knip to identify all unused files and unreferenced logic. — *Traces To: REQ-3*
*   **Guided Deletion** — Automated agents will execute deletions based on the manifesto, starting with low-risk items (imports/vars) and moving to high-risk items (files/methods). — *Traces To: REQ-1*
*   **Verification Gates** — A final CI/CD pass using `mvn verify` and `npm run test:coverage` to ensure no functional regression or build failures. — *Traces To: REQ-4*
*   **Merge Strategy** — All deletions will be committed to a single 'cleanup' branch for final review and merge. — *Traces To: CON-1*

**Alternatives Considered**
*   **Approach 2: Static-Only Sweep** — Focusing exclusively on static analysis findings. *(rejected: Misses many unused files and public methods, failing the zero-debt goal)*
*   **Approach 3: Test-Driven Elimination** — Targeting unexecuted code based on coverage reports. *(rejected: Higher risk of false positives where reachable but untested code is removed)*

**Decision Matrix**
| Criterion | Weight | Approach 1 (Selected) | Approach 2 (Low-Risk) | Approach 3 (Dynamic) |
|-----------|--------|------------------|-----------------------|----------------------|
| **Zero-Debt Baseline** | 40% | 5: Comprehensive sweep. | 2: Misses many items. | 4: Deep impact. |
| **Risk Mitigation** | 30% | 4: Guided deletion and gates. | 5: Lowest risk. | 2: High false positives. |
| **Traceability** | 20% | 5: Manifesto-backed. | 3: Simple linter output. | 4: Test coverage data. |
| **Setup Effort** | 10% | 3: Configuration required. | 5: Uses existing tools. | 2: Complex setup. |
| **Weighted Total** | | **4.5** | **3.5** | **3.2** |

## 4. Architecture

**Cleanup Pipeline**
1.  **Scanner Phase** — SonarQube, PMD (backend), and Knip (frontend) scan the codebase to identify unused files, exports, methods, variables, and imports. — *Traces To: REQ-3*
2.  **Audit & Manifesto Generation** — The scanner outputs are consolidated into a structured 'Dead Code Manifesto' that lists all deletion candidates. — *Traces To: REQ-5*
3.  **Refinement Engine** — A cross-referencing logic validates deletion candidates against high-risk areas (e.g., Spring/JPA entities, dynamic routes). — *Traces To: REQ-6*
4.  **Execution Phase** — Automated agents execute deletions based on the refined manifesto, committing changes to the single 'cleanup' branch. — *Traces To: REQ-1*
5.  **Verification Pass** — The build and test scripts are executed to ensure no functional regression. — *Traces To: REQ-4*

**Key Components**
*   **Audit Sub-agent** — Specializes in running scanners and generating the Dead Code Manifesto. — *Rationale: Separates discovery from implementation to avoid conflicting logic.*
*   **Coder Sub-agent** — Executes deletions and handles cleanup-related code refactoring. — *Rationale: Leverages existing implementation skills for surgical updates.*
*   **Verification Gatekeeper** — Manages the final CI/CD pass and provides the 'go/no-go' signal for the merge. — *Rationale: Ensures that only stable changes are merged into the main codebase.*

## 5. Agent Team

**Agent Roles & Responsibilities**
*   **Architect (1)** — Responsible for overall system design, high-risk area identification, and defining the 'Dead Code Manifesto' structure. — *Traces To: REQ-6*
*   **Audit Sub-agent (1)** — Specializes in running static analysis tools (SonarQube, PMD, Knip) and generating the 'Dead Code Manifesto'. — *Traces To: REQ-3*
*   **Coder (2)** — Executes the deletions based on the manifesto, handling refactoring of related code and imports. — *Traces To: REQ-1*
*   **Tester (1)** — Executes and monitors the verification pass to ensure no functional regression. — *Traces To: REQ-4*
*   **Code Reviewer (1)** — Performs a final audit of the 'cleanup' branch before merging. — *Traces To: REQ-5*

**Collaboration Model**
- **Sequential Execution** — The Architect and Audit agents work first to define the scope and manifest.
- **Parallel Dispatch** — Two Coder agents work in parallel on non-overlapping modules (one on backend, one on frontend). — *Rationale: Speeds up the implementation phase while maintaining clear ownership.*
- **Unified Validation** — The Tester agent validates the final state of the entire branch before the Code Reviewer's final pass.

## 6. Risk Assessment

**Identified Risks**
*   **Risk 1: False Positives in Static Analysis** — Code used via reflection (e.g., Spring/JPA entities, MapStruct mappers) or dynamic imports (frontend routing) may appear unreferenced to tools. — *Severity: High*
*   **Risk 2: Breaking Functional Logic** — Deleting code that is reachable but untested could lead to functional regressions. — *Severity: High*
*   **Risk 3: Build & Deployment Failures** — Mass deletions could lead to circular dependency issues or configuration errors. — *Severity: Medium*
*   **Risk 4: Complexity of Manual Review** — Reviewing a single large cleanup branch for 500+ files may lead to 'review fatigue'. — *Severity: Medium*

**Mitigation Strategies**
*   **MIT-1: High-Risk Exclusion** — Explicitly exclude Spring `@Configuration`, JPA entities, and known dynamic routes from automated removal. — *Traces To: REQ-6*
*   **MIT-2: Verification Gatekeeping** — Mandatory execution of build and test scripts for all deletion cycles. — *Traces To: REQ-4*
*   **MIT-3: Manifesto Validation** — The Dead Code Manifesto will be reviewed by the Architect before any deletions are executed. — *Traces To: REQ-5*
*   **MIT-4: Incremental Commit & Rollback** — Commits to the 'cleanup' branch will be structured to allow for easy rollback. — *Rationale: Provides a safety net for large-scale changes.*

## 7. Success Criteria

**Measurable Outcomes**
*   **SC-1: Zero-Debt Baseline** — Scanners return 'zero findings' for unused files, exports, and imports. — *Traces To: REQ-1*
*   **SC-2: Full Build Stability** — Both the backend and frontend builds must pass without errors. — *Traces To: REQ-4*
*   **SC-3: Test Coverage Consistency** — Coverage reports must show no regression compared to the pre-cleanup baseline. — *Traces To: REQ-7*
*   **SC-4: Reduction in Code Volume** — A measurable decrease in the number of files and lines of code (LOC). — *Rationale: Provides a clear metric for technical debt reduction.*
*   **SC-5: Successful Review & Merge** — The 'cleanup' branch must be merged with zero critical findings. — *Traces To: REQ-5*
