# Error code registry

Backend error codes returned via `ErrorResponse` and `ValidationErrorResponse`.

Envelope shapes:

- `ErrorResponse { code, message, details, traceId }` — general errors (auth, access, business logic, unexpected).
- `ValidationErrorResponse { code, message, errors: [{ field, message, code }], traceId }` — field-level validation failures.

## Top-level codes (ErrorResponse / ValidationErrorResponse `code` field)

| Code | HTTP status | Meaning | Triggering site |
|---|---|---|---|
| `VALIDATION_FAILURE` | 400 | One or more request fields failed validation. | `GlobalExceptionHandler.handleMethodArgumentNotValidException`, `GlobalExceptionHandler.handleIllegalArgumentException`, `GlobalExceptionHandler.handleValidationException` |
| `AUTH_FAILURE` | 401 | Authentication failed (no valid session / bad credentials). | `GlobalExceptionHandler.handleAuthenticationException` |
| `ACCESS_DENIED` | 403 | Authenticated but insufficient permissions. | `GlobalExceptionHandler.handleAccessDeniedException` |
| `NOT_FOUND` | 404 | Requested resource does not exist or the caller is not permitted to know it exists. | `ProfileNotFoundException` |
| `CATEGORY_NOT_FOUND` | 404 | The referenced category does not exist. | `CategoryNotFoundException` |
| `DUPLICATE_EMAIL` | 409 | Registration attempted with an email already in use. | `DuplicateEmailException` |
| `DUPLICATE_CATEGORY` | 409 | A category with that name already exists in the user's workspace. | `DuplicateCategoryException` |
| `INVALID_CATEGORY_DESIGN` | 400 | Invalid category configuration (e.g. bad icon/color). | `InvalidCategoryDesignException` |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled server-side error. | `GlobalExceptionHandler.handleGenericException` |

## Field-level validation codes (ValidationErrorResponse `errors[].code` field)

These appear inside the `errors` array of a `ValidationErrorResponse`.

| Code | Meaning | Triggering site |
|---|---|---|
| `VALIDATION_ERROR` | Generic field constraint violation (fallback when no specific code matched). | `GlobalExceptionHandler.handleMethodArgumentNotValidException` (default branch) |
| `REQUIRED` | Field is null but required (`@NotNull` or `"required"` message). | `GlobalExceptionHandler.handleMethodArgumentNotValidException` / `handleIllegalArgumentException` |
| `AMOUNT_POSITIVE` | Amount must be greater than zero (`@DecimalMin`). | `GlobalExceptionHandler.handleMethodArgumentNotValidException` / `handleIllegalArgumentException` |
| `AMOUNT_MAX_DECIMALS` | Amount has more than two decimal places. | `GlobalExceptionHandler.handleIllegalArgumentException` |
| `FUTURE_DATE_REJECT` | Transaction date is in the future (`@PastOrPresent`). | `GlobalExceptionHandler.handleMethodArgumentNotValidException` / `handleIllegalArgumentException` |
| `TYPE_INVALID` | Transaction type value is not a recognised enum member. | `GlobalExceptionHandler.handleIllegalArgumentException` |
| `RECURRING_UNIT_REQUIRED` | `frequencyUnit` is required when `isRecurring` is true. | `GlobalExceptionHandler.handleIllegalArgumentException` |
| `RECURRING_MULTIPLIER_POSITIVE` | `frequencyMultiplier` must be a positive integer when `isRecurring` is true. | `GlobalExceptionHandler.handleIllegalArgumentException` |
| `BAD_REQUEST` | Generic bad-request fallback when no specific field mapping matched. | `GlobalExceptionHandler.handleIllegalArgumentException` (default branch) |
