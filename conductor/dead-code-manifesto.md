# Dead Code Manifesto

This document identifies all unused and unreachable code across the Kaizen codebase, categorized by risk and module.

## Backend (Java)

### High Confidence (Safe to Delete)
| File | Finding | Rationale |
|------|---------|-----------|
| `backend/src/main/java/com/kaizen/backend/common/mapper/ExampleMapper.java` | Unused Class | Boilerplate mapper with zero references. |
| `backend/src/main/java/com/kaizen/backend/common/mapper/dto/ExampleSource.java` | Unused Record | Supporting DTO for ExampleMapper; zero references. |
| `backend/src/main/java/com/kaizen/backend/common/mapper/dto/ExampleTarget.java` | Unused Record | Supporting DTO for ExampleMapper; zero references. |
| `PersistentSessionFilter.java` (line 145) | Unused Private Method | `handleAuthenticationFailure` is never called within the filter. |
| `TransactionService.java` (line 418) | Unused Private Method | `requireTransactionId` is never called. |

### Mid Confidence (Requires Verification)
| File | Finding | Rationale |
|------|---------|-----------|
| `PaymentMethod.java` (line 27) | Unused Assignment | Field `global` initialized but immediately overwritten. |
| `ReminderSchedule.java` (line 33) | Unused Assignment | Field `isEnabled` initialized but immediately overwritten. |
| `ReminderSchedule.java` (line 38) | Unused Assignment | Field `retryCount` initialized but immediately overwritten. |
| `UserFundingSource.java` (line 39) | Unused Assignment | Field `currentBalance` initialized but immediately overwritten. |
| `BaseEntity.java` (line 20) | Empty Abstract Class | No abstract methods; should be reviewed for structural redundancy. |
| `OnboardingProgressResponse.java` (line 36) | SystemPrintln | Usage of `System.out` instead of structured logging. |

---

## Frontend (TypeScript)

### High Confidence (Safe to Delete)
| Path | Type | Rationale |
|------|------|-----------|
| `src/features/home/index.ts` | File | Redundant re-export; components imported directly. |
| `src/features/payment-methods/index.ts` | File | Redundant re-export; components imported directly. |
| `src/features/budgets/SmartBudgetPage.tsx` | File | Orphan page; not registered in `RootLayout` or `App.tsx`. |
| `src/features/budgets/BudgetTooltip.tsx` | File | Component never used in budget views. |
| `src/features/budgets/helpTargets.ts` | File | Configuration for unused tooltip. |
| `src/features/goals/GoalsEmptyStatePlaceholder.tsx` | File | Goals feature uses a different empty state. |
| `src/shared/lib/validation.ts` | File | Replaced by inline component validation logic. |
| `src/shared/hooks/useCurrencyFormatter.ts` | File | Shared util `formatCurrency` is preferred. |

### Mid Confidence (Requires Verification)
| File | Finding | Rationale |
|------|---------|-----------|
| `src/features/onboarding/onboardingSlice.ts` | Unused Exports | `setStartingFundsInput`, `advanceToNextStep`, `selectInitialTransactionDate` are obsolete. |
| `src/features/transactions/transactionApi.ts` | Unused Mutation | `useBulkDeleteTransactionsMutation` and its interfaces are unreferenced. |
| `package.json` | Unused Dependency | `react-window` and `@types/react-window`. |
| `vite.config.ts` | Redundant Config | `react-window` in `optimizeDeps`. |

## Risk Mitigation
- **Reflection-Based Classes:** Spring `@Configuration`, JPA `@Entity`, and MapStruct mappers (excluding ExampleMapper) are excluded from this sweep.
- **Dynamic Routing:** Verified that `SmartBudgetPage` is not referenced in any dynamic route registry.
