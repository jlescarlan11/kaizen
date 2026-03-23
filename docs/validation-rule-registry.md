# Validation Rule Registry

| Rule | Field(s) | Message | Governing Constant / Flag |
| --- | --- | --- | --- |
| Balance presence | `openingBalance` | `ValidationConstants.BALANCE_REQUIRED_ERROR` | `@NotNull` + `OnboardingInputValidator` |
| Balance positivity | `openingBalance` | `ValidationConstants.BALANCE_POSITIVE_ERROR` | `OnboardingInputValidator` |
| Balance maximum | `openingBalance` | `ValidationConstants.BALANCE_MAX_LIMIT_ERROR` | `ValidationProperties.maxBalanceValue` (PRD Open Question 1) |
| Budget amount positivity | `budgets[i].amount` | `ValidationConstants.BUDGET_AMOUNT_POSITIVE_ERROR` | `BudgetValidationService`
| Budget amount ≤ balance (per entry) | `budgets[i].amount` | `ValidationConstants.BUDGET_OVER_BALANCE_ERROR` | `ValidationProperties.budgetBalanceConstraintEnabled` (PRD Open Question 2)
| Combined budgets ≤ balance | `budgets.total` | `ValidationConstants.BUDGET_TOTAL_OVER_BALANCE_ERROR` | `ValidationProperties.budgetBalanceConstraintEnabled` (PRD Open Question 2)
| Non-existent category | `budgets[i].categoryId` | `ValidationConstants.CATEGORY_NOT_FOUND_ERROR` | `BudgetValidationService` (uses `CategoryRepository.findAccessibleByIds`)
| Duplicate category | `budgets.categoryId` | `ValidationConstants.DUPLICATE_CATEGORY_ERROR` | `BudgetValidationService`
