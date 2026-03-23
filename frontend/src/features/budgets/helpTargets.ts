/**
 * Target for the Smart Budget "Learn more" link.
 *
 * PRD Open Question 8: confirm whether this link should open
 * 1) an in-app static screen (`/help/smart-budget` or similar),
 * 2) a WebView pointing to a hosted help center article, or
 * 3) an external browser URL managed by marketing.
 *
 * The actual value must be supplied through `VITE_BUDGET_SUGGESTION_HELP_URL`
 * so the navigation target can be changed without touching source code.
 */
export const SMART_BUDGET_LEARN_MORE_TARGET =
  import.meta.env.VITE_BUDGET_SUGGESTION_HELP_URL?.trim() ?? ''
