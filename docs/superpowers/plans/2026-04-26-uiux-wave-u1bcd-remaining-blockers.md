# Wave U-1b/c/d — Remaining U-1 BLOCKERS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the three remaining U-1 BLOCKER sub-bundles in one stacked branch so they can be smoke-tested together: U-VIS-2 (TransactionList amber state), U-FRM-1 (TransactionEntryForm validation timing), U-API-1/2/3 (backend create/delete status codes).

**Architecture:** Three independent sub-waves on the existing `fix/uiux-u1-blockers` branch (renamed from `fix/uiux-u1a-insights-cleanup`). Each sub-wave is one or two tasks, each ending with a commit. Frontend gate = typecheck + lint + build. Backend gate = `mvn compile` + `mvn test`. No new test runners introduced.

**Tech Stack:** React 19 / TypeScript / Tailwind v4 (frontend), Spring Boot 3 / Java 21 (backend).

**Spec:** `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md` — findings U-VIS-2, U-FRM-1, U-API-1, U-API-2, U-API-3.

**Branch:** Already on `fix/uiux-u1-blockers`. Stack U-1b/c/d directly on top of the U-1a commits (3e89255 → 21d09ee). Manual browser smoke test runs **once at the end** (Task 8) after all three sub-waves are committed.

---

## File Structure

| File | Sub-wave | Touched by |
|------|----------|------------|
| `frontend/src/features/transactions/components/TransactionList.tsx` | U-1b | Task 1 |
| `frontend/src/features/transactions/components/TransactionEntryForm.tsx` | U-1c | Task 2 |
| `backend/src/main/java/com/kaizen/backend/payment/controller/PaymentMethodController.java` | U-1d | Task 3 |
| `backend/src/main/java/com/kaizen/backend/transaction/controller/ReceiptAttachmentController.java` | U-1d | Task 3 |
| `backend/src/main/java/com/kaizen/backend/auth/controller/SessionController.java` | U-1d | Task 3 |

No new files. No deletions.

---

## Task 1 — U-1b: TransactionList missing-category state

**Files:**
- Modify: `frontend/src/features/transactions/components/TransactionList.tsx`

**Closes:** U-VIS-2 — replace the four amber sites and one `font-black` with semantic warning tokens / allowed weight.

**Why this is in U-1 and not U-2c:** The amber sites are a *mandatory-standard violation* (CODING_STANDARDS §1.7.1 forbids `text-amber-*` and `font-black`), and the missing-category state is a real user-facing semantic warning that should map to the `ui-warning` token family. U-2c (broader font-bold cleanup) is a *codebase-wide* sweep — this task is the single-file blocker that ships now.

- [ ] **Step 1: Read** `frontend/src/features/transactions/components/TransactionList.tsx` lines 155–260 to confirm the five sites still match what the audit cited.

- [ ] **Step 2: Apply five `Edit` operations using the unique-context discipline** (each `old_string` long enough to be unique).

**Edit 2.1** — row wrapper highlight at line 169:

`old_string`:
```
            !tx.category &&
              !selectedIds.includes(tx.id) &&
              'border-amber-400 bg-amber-50/20 dark:bg-amber-950/5',
```

`new_string`:
```
            !tx.category &&
              !selectedIds.includes(tx.id) &&
              'border-ui-warning bg-ui-warning-subtle/30',
```

**Edit 2.2** — missing-category icon container at line 189:

`old_string`:
```
                  tx.type === 'INCOME'
                    ? 'bg-ui-success/10 text-ui-success'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500',
```

`new_string`:
```
                  tx.type === 'INCOME'
                    ? 'bg-ui-success/10 text-ui-success'
                    : 'bg-ui-warning-subtle text-ui-warning-text',
```

**Edit 2.3** — missing-category description text at line 208:

`old_string`:
```
                    tx.category
                      ? 'text-foreground group-hover:text-primary'
                      : 'text-amber-700 dark:text-amber-500',
```

`new_string`:
```
                    tx.category
                      ? 'text-foreground group-hover:text-primary'
                      : 'text-ui-warning-text',
```

**Edit 2.4** — missing-category badge text at line 238 (also drops `font-bold`):

`old_string`:
```
                {!tx.category && (
                  <span className="ml-2 text-amber-600/70 dark:text-amber-500/50 font-bold uppercase tracking-wide">
                    • Missing category
                  </span>
                )}
```

`new_string`:
```
                {!tx.category && (
                  <span className="ml-2 text-ui-warning-text/80 font-medium uppercase tracking-wide">
                    • Missing category
                  </span>
                )}
```

**Edit 2.5** — amount display at line 248 (drops `font-black`):

`old_string`:
```
            <p
              className={cn(
                'text-lg font-black tracking-tight',
                tx.type === 'EXPENSE' ? 'text-foreground' : 'text-ui-success',
              )}
            >
```

`new_string`:
```
            <p
              className={cn(
                'text-lg font-semibold tracking-tight',
                tx.type === 'EXPENSE' ? 'text-foreground' : 'text-ui-success',
              )}
            >
```

**Notes for the engineer:**

- Other forbidden weights remain in this file (e.g., `text-xl font-bold` on the icon's `?`, `text-base font-bold` on the description, `font-black` on the Syncing badge). They are *out of U-1b's scope* — they're U-VIS-5 in Wave U-2c. Do **not** touch them in this task. Resist the urge.
- `text-ui-warning-text/80` opacity preserves the visual de-emphasis that the original `/70` and `/50` opacities provided. The semantic token auto-themes; no `dark:` variant is needed.

- [ ] **Step 3: Verify gate**

```bash
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run build
```

All three must succeed.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/transactions/components/TransactionList.tsx
git commit -m "$(cat <<'EOF'
fix(transactions): swap TransactionList amber state for semantic warning tokens

- Row wrapper border + bg use border-ui-warning + bg-ui-warning-subtle/30.
- Missing-category icon container, description text, and badge use
  text-ui-warning-text and bg-ui-warning-subtle (auto-themes; no dark:
  variants needed).
- Amount display drops font-black for font-semibold per CODING_STANDARDS
  §1.7.1.
- Missing-category badge drops font-bold for font-medium.

Closes U-VIS-2.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2 — U-1c: TransactionEntryForm validation timing

**Files:**
- Modify: `frontend/src/features/transactions/components/TransactionEntryForm.tsx`

**Closes:** U-FRM-1 — `validateField()` currently fires inside every `onChange` handler, surfacing error messages letter-by-letter as the user types. CODING_STANDARDS §1.7.2 #3 says "Errors should not appear before the user has interacted with a field. Validation should trigger on blur or form submission."

**Behavior change.** The form's perceived "feel" changes (errors appear later in the typing flow). Manual smoke test in Task 8 must walk a happy-path entry plus at least one validation-failure path on every field.

- [ ] **Step 1: Read** `frontend/src/features/transactions/components/TransactionEntryForm.tsx` lines 405–490 to confirm the five `validateField` call sites still match what the audit cited.

- [ ] **Step 2: For each TEXT input**, move `validateField` from `onChange` to `onBlur`. **For SELECTORS** (`CategorySelector`, `PaymentMethodSelector`), keep `validateField` in `onChange` because for select-style controls "change" is the user's commit moment, equivalent to a text input's blur — this matches the spirit of CODING_STANDARDS §1.7.2 #3 (which targets the *typing* interaction).

**Edit 2.1** — Amount input (line ~412): keep `setAmount` in onChange, move validation to onBlur.

`old_string`:
```
        <Input
          label="Amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            validateField('amount', e.target.value)
          }}
          error={errors.amount}
```

`new_string`:
```
        <Input
          label="Amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={(e) => validateField('amount', e.target.value)}
          error={errors.amount}
```

**Edit 2.2** — Date input (line ~461):

`old_string`:
```
          <Input
            label="Date (Optional)"
            type="date"
            value={transactionDate}
            onChange={(e) => {
              setTransactionDate(e.target.value)
              validateField('transactionDate', e.target.value)
            }}
            error={errors.transactionDate}
            helperText={editId ? undefined : 'Captured at submission if not set.'}
          />
```

`new_string`:
```
          <Input
            label="Date (Optional)"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            onBlur={(e) => validateField('transactionDate', e.target.value)}
            error={errors.transactionDate}
            helperText={editId ? undefined : 'Captured at submission if not set.'}
          />
```

**Edit 2.3** — Description input (line ~477):

`old_string`:
```
          <Input
            label="Description (Optional)"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              validateField('description', e.target.value)
            }}
            error={errors.description}
          />
```

`new_string`:
```
          <Input
            label="Description (Optional)"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={(e) => validateField('description', e.target.value)}
            error={errors.description}
          />
```

**Selector sites left untouched:**
- `CategorySelector` `onChange` at ~line 428: keep `validateField` inline — selecting a value is the commit action.
- `PaymentMethodSelector` `onChange` at ~line 440: same.

The commit message reflects this distinction.

- [ ] **Step 3: Verify the `Input` component supports `onBlur`.**

Run: read `frontend/src/shared/components/Input.tsx` and confirm it spreads `...props` (or otherwise accepts `onBlur`). If it has a custom `onBlur` handler that we'd be overriding, escalate as BLOCKED — the plan needs a different shape.

- [ ] **Step 4: Verify gate**

```bash
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run build
```

If `onBlur` types reject the event handler signature, check whether `Input` types its props. If yes, the handler must match its declared signature.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/transactions/components/TransactionEntryForm.tsx
git commit -m "$(cat <<'EOF'
fix(transactions): move TransactionEntryForm validation to onBlur for text inputs

Per CODING_STANDARDS §1.7.2 #3, error messages must not appear during
typing; validation triggers on blur or submit. Three text inputs
(amount, date, description) now run validateField in onBlur instead of
onChange. The two selectors (CategorySelector, PaymentMethodSelector)
keep onChange validation because for select-style controls "change" is
the user's commit action, equivalent in spirit to a text input's blur.

Real-time visual affordances (insufficient-balance hint) stay on
onChange — they are hints, not error messages.

Closes U-FRM-1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 — U-1d: Backend create/delete status codes

**Files:**
- Modify: `backend/src/main/java/com/kaizen/backend/payment/controller/PaymentMethodController.java`
- Modify: `backend/src/main/java/com/kaizen/backend/transaction/controller/ReceiptAttachmentController.java`
- Modify: `backend/src/main/java/com/kaizen/backend/auth/controller/SessionController.java`

**Closes:** U-API-1, U-API-2, U-API-3.

**Approach:** match the canonical pattern already present in `BudgetController` (`@ResponseStatus(HttpStatus.CREATED)` annotation on POST methods + return the body directly). DELETE-success uses `@ResponseStatus(HttpStatus.NO_CONTENT)` or `ResponseEntity.noContent().build()` (the codebase already has both; either is fine — pick the one that's least disruptive to surrounding code).

- [ ] **Step 1: Read each of the three controllers** to confirm the offending sites still exist:
  - `PaymentMethodController.java` line ~50–55 — POST `createPaymentMethod` returns `ResponseEntity.ok(...)`.
  - `ReceiptAttachmentController.java` line ~32–38 — POST `uploadAttachment` returns `ResponseEntity.ok(...)`.
  - `SessionController.java` line ~73–84 — DELETE `revokeSession` returns `ResponseEntity.ok().build()` for success.

- [ ] **Step 2: Edit `PaymentMethodController.java`**

Add `import org.springframework.http.HttpStatus;` near the top if not already present (check first). Add `import org.springframework.web.bind.annotation.ResponseStatus;` if not already present.

Replace the `createPaymentMethod` method:

`old_string`:
```java
    @PostMapping
    @Operation(summary = "Create a custom payment method")
    public ResponseEntity<PaymentMethodResponse> createPaymentMethod(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody PaymentMethodCreatePayload payload
    ) {
        return ResponseEntity.ok(paymentMethodService.createPaymentMethod(userDetails.getUsername(), payload));
    }
```

`new_string`:
```java
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a custom payment method")
    public PaymentMethodResponse createPaymentMethod(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody PaymentMethodCreatePayload payload
    ) {
        return paymentMethodService.createPaymentMethod(userDetails.getUsername(), payload);
    }
```

If `ResponseEntity` is no longer used anywhere else in this file, remove its import (`import org.springframework.http.ResponseEntity;`). Otherwise leave it.

- [ ] **Step 3: Edit `ReceiptAttachmentController.java`**

Add the same two imports (`HttpStatus`, `ResponseStatus`) if missing.

Replace the `uploadAttachment` method:

`old_string`:
```java
    @PostMapping("/{transactionId}/attachments")
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long transactionId,
            @RequestParam("file") MultipartFile file) throws IOException {
        TransactionAttachment attachment = attachmentService.attachReceipt(transactionId, file);
        return ResponseEntity.ok(mapToResponse(attachment));
    }
```

`new_string`:
```java
    @PostMapping("/{transactionId}/attachments")
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentResponse uploadAttachment(
            @PathVariable Long transactionId,
            @RequestParam("file") MultipartFile file) throws IOException {
        TransactionAttachment attachment = attachmentService.attachReceipt(transactionId, file);
        return mapToResponse(attachment);
    }
```

The other endpoints in this file still return `ResponseEntity<...>`, so leave the `ResponseEntity` import in place.

- [ ] **Step 4: Edit `SessionController.java`**

Replace the success branch of `revokeSession` (line ~79):

`old_string`:
```java
        if (sessionOpt.isPresent()) {
            PersistentSession session = sessionOpt.get();
            // Security check: ensure the session belongs to the user
            if (session.getUserAccount().getId().equals(user.getId())) {
                persistentSessionRepository.delete(session);
                return ResponseEntity.ok().build();
            }
        }

        return ResponseEntity.notFound().build();
    }
```

`new_string`:
```java
        if (sessionOpt.isPresent()) {
            PersistentSession session = sessionOpt.get();
            // Security check: ensure the session belongs to the user
            if (session.getUserAccount().getId().equals(user.getId())) {
                persistentSessionRepository.delete(session);
                return ResponseEntity.noContent().build();
            }
        }

        return ResponseEntity.notFound().build();
    }
```

The not-found branch stays at 404 (correct semantics).

- [ ] **Step 5: Verify backend gate**

Run from the repo root (Maven is system-wide per `migrate.ps1`/`dev.ps1`):

```bash
cd backend && mvn -q compile
cd backend && mvn -q test
```

Both must succeed. Backend tests are at the service layer; no controller tests reference these endpoints, so the status-code change should not break anything. If a test fails, escalate as BLOCKED with the failure output.

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/kaizen/backend/payment/controller/PaymentMethodController.java backend/src/main/java/com/kaizen/backend/transaction/controller/ReceiptAttachmentController.java backend/src/main/java/com/kaizen/backend/auth/controller/SessionController.java
git commit -m "$(cat <<'EOF'
fix(api): align create/delete status codes with REST conventions

- PaymentMethodController.createPaymentMethod: 200 -> 201 via
  @ResponseStatus(HttpStatus.CREATED); return body directly. Matches
  the canonical pattern in BudgetController.
- ReceiptAttachmentController.uploadAttachment: 200 -> 201 via the same
  pattern.
- SessionController.revokeSession: success branch returns 204 (No
  Content) instead of 200; the not-found branch stays at 404.

The frontend's RTK Query handlers accept any 2xx response, so no
consumer changes are required. Closes U-API-1, U-API-2, U-API-3.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4 — Final verification + ready-for-PR (combined)

**Files:** None modified.

- [ ] **Step 1: Re-run the full gate (frontend + backend)**

```bash
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run build
cd ../backend && mvn -q compile
cd ../backend && mvn -q test
```

All five must pass.

- [ ] **Step 2: Confirm git state**

```bash
git -C D:/kaizen log --oneline ee99ba4..HEAD
git -C D:/kaizen status
```

Expected: working tree clean (modulo the pre-existing `.claude/*` untracked state); the log shows the U-1a commits (3e89255 → 21d09ee), then the U-1bcd plan commit, then three new fix commits (one per sub-wave).

- [ ] **Step 3: Surface to user with the manual-test checklist**

The user runs `npm run dev` and walks:

**For U-1a (already shipped):**
- `/insights` light + dark — every section title visible, period selector works, charts render, dark mode contrast.

**For U-1b:**
- Make a transaction with no category. Confirm: row left-border + bg use the warning palette; missing-category icon + text use warning tokens; amount display weight is `font-semibold` (subtle weight diff from before).

**For U-1c:**
- Open the add-transaction form. Type into Amount, Date (optional), Description: NO error appears during typing. Tab away (blur): error appears if the value is invalid. Click Submit on a blank form: all field errors appear. Selectors (Category, Payment Method): selecting a value runs validation immediately (this is intentional).

**For U-1d:**
- Network tab: create a Payment Method → response status 201; upload a Receipt → 201; revoke a session from `/your-account/sessions` → 204.

Suggest PR title: `fix(uiux): wave U-1 — pre-prod BLOCKERS (Insights cleanup, TransactionList tokens, form validation timing, API status codes)`. Do NOT auto-open the PR with `gh`; the user opens it after smoke-testing.

---

## Self-Review

**1. Spec coverage:** Walk every claimed audit finding.
- U-VIS-2 → Task 1 covers all four amber sites + the `font-black` amount. ✅
- U-FRM-1 → Task 2 covers the three text-input validateField sites; selectors deliberately retained per CODING_STANDARDS §1.7.2 #3 reading. ✅
- U-API-1 → Task 3 covers PaymentMethodController and (by example) the broader pattern. ✅
- U-API-2 → Task 3 covers ReceiptAttachmentController. ✅
- U-API-3 → Task 3 covers SessionController. ✅

No claimed finding lacks a task.

**2. Placeholder scan:** No `TBD`, `TODO` (one comment in Task 2 deliberately retains the selector behavior — that's an explanation, not a placeholder), no "implement later," no "similar to Task N." Every code block is concrete.

**3. Type / name consistency:**
- `border-ui-warning`, `bg-ui-warning-subtle`, `text-ui-warning-text` — all exist per `frontend/src/shared/styles/index.css:88-90`.
- `@ResponseStatus(HttpStatus.CREATED)` and `@ResponseStatus(HttpStatus.NO_CONTENT)` — Spring Web standard annotations.
- `ResponseEntity.noContent().build()` — Spring Web standard.
- Three controller method names (`createPaymentMethod`, `uploadAttachment`, `revokeSession`) match the actual code.
- Three commit-message structures align across the file edits.

No drift detected.
