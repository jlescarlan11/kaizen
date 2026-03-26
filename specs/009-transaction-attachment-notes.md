# Product Requirements Document

---

## 1. Document Header

| Field                      | Value                           |
| -------------------------- | ------------------------------- |
| **Product / Feature Name** | Transaction Attachments & Notes |
| **Version**                | 1.0                             |
| **Status**                 | Draft                           |
| **Last Updated**           | _(fill in)_                     |
| **Author**                 | _(fill in)_                     |

---

## 2. Problem Statement

Users who log transactions record the mechanical facts — amount, date, category — but have no way to attach supporting context to a record. A transaction amount alone does not tell the user why the purchase was made, what it covered, or whether a receipt exists to verify it. Over time, transactions that made sense when logged become ambiguous or unverifiable, particularly for expenses that may need justification — reimbursable work costs, disputed charges, or purchases the user simply cannot remember.

Without a notes field, users resort to encoding context into the transaction description or category in ways that distort the data, or they abandon the effort entirely and accept that their records are contextually incomplete. Without receipt attachment, paper and digital receipts remain disconnected from the transactions they document — stored separately, easily lost, and unavailable when needed for verification or dispute. The result is a ledger that is numerically complete but contextually thin.

Success looks like a user who can attach a receipt image directly to any transaction and add a freeform note capturing whatever detail matters to them — and who can retrieve both instantly when reviewing a record, without hunting through separate files, email inboxes, or memory.

---

## 3. User Personas

| Field               | Content                                                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Personal Finance User                                                                                                                                                                                                       |
| **Role**            | User                                                                                                                                                                                                                        |
| **Primary Goal**    | Attach supporting context — receipts and freeform notes — to transaction records so that every entry is self-contained and verifiable                                                                                       |
| **Key Pain Points** | No way to link a receipt to the transaction it documents; no freeform field for capturing details that do not fit structured fields; transactions become ambiguous over time without context recorded at the point of entry |
| **Stories Owned**   | Stories 31, 32                                                                                                                                                                                                              |

---

## 4. Feature List

### Feature 1: Receipt Attachment

A file attachment mechanism on each transaction that allows the user to associate one or more receipt images or documents with the record.

- Story 31: _"As a user, I want to add receipts to transactions so that I can keep records."_

**Core value:** Keeps receipt documentation co-located with the transaction it verifies, eliminating the need to cross-reference separate file systems or physical storage.

---

### Feature 2: Transaction Notes

A freeform text field on each transaction where the user can record any detail not captured by the transaction's structured fields.

- Story 32: _"As a user, I want to add notes to transactions so that I can remember details."_

**Core value:** Gives users a low-friction way to capture context — purpose, people involved, reimbursement status, or any other detail — at the point of entry or at any time after.

`[Priority unconfirmed — verify with author]` — Both features are independent enrichment fields on the transaction record. Neither is a prerequisite for the other. Final priority should be confirmed with the product owner.

---

## 5. Acceptance Criteria

---

**Story 31:** _"As a user, I want to add receipts to transactions so that I can keep records."_

Acceptance Criteria:

- [ ] Given the user is adding or editing a transaction, when they access the receipt field, then they can attach a file from their device's camera, photo library, or file storage. `[INFERRED — verify with author: confirm which attachment sources are supported — camera capture, photo library, file picker, or all three]`
- [ ] Given the user attaches a receipt file and saves the transaction, when the transaction is saved, then the receipt is stored and associated with that transaction — it is retrievable from the transaction detail view.
- [ ] Given the user opens a transaction with an attached receipt, when they view the detail, then a visible indicator confirms a receipt is attached, and the user can open or preview the file without leaving the transaction context.
- [ ] Given a transaction has an attached receipt, when the user replaces it with a different file, then the new file is stored and the previous one is removed — no orphaned files remain associated with the transaction. `[INFERRED — verify with author: confirm whether multiple receipts per transaction are supported or only one]`
- [ ] Given the user attaches a file that exceeds the maximum allowed size, when they attempt to save, then the attachment is rejected with an error stating the size limit — the transaction itself is not blocked from saving. `[INFERRED — verify with author: confirm maximum file size]`
- [ ] Given the user attaches a file in an unsupported format, when they attempt to attach it, then the action is rejected with an error identifying the accepted formats — the transaction is not blocked. `[INFERRED — verify with author: confirm accepted file formats — JPEG, PNG, PDF, or others]`
- [ ] Given a transaction has no receipt attached, when the user views it in the list or detail view, then no receipt indicator is shown — the absence of an attachment is visually neutral.

---

**Story 32:** _"As a user, I want to add notes to transactions so that I can remember details."_

Acceptance Criteria:

- [ ] Given the user is adding or editing a transaction, when they access the notes field, then they can enter freeform text of any content.
- [ ] Given the user enters a note and saves the transaction, when the transaction is saved, then the note is stored and displayed in the transaction detail view.
- [ ] Given the user views a transaction with a note, when they view the detail, then the full note content is visible — it is not truncated in the detail view.
- [ ] Given the note field has a maximum character limit, when the user reaches or exceeds it, then the input is restricted or a character count indicator is shown — the user is not able to save a note that exceeds the limit without feedback. `[INFERRED — verify with author: confirm whether a character limit exists and what it is]`
- [ ] Given the user saves a transaction with an empty notes field, when the transaction is displayed, then no note indicator or empty placeholder is shown — the absence of a note is visually neutral.
- [ ] Given the user edits an existing transaction and clears a previously saved note, when the edit is saved, then the note is removed and the transaction is stored with no note — not with a blank string. `[INFERRED — verify with author: confirm null vs. empty string handling]`
- [ ] Given the transaction list is displayed, when a transaction has a note, then a visible indicator (e.g., an icon) distinguishes it from transactions without notes — without displaying the note content in the list view. `[INFERRED — verify with author: confirm whether a note indicator is shown in list view]`

---

## 6. Technical Constraints

### 6a. Functional Constraints

- Receipt attachment (Story 31) must not block transaction save. If the attachment fails, the transaction data must still be saved and the user must be notified of the attachment failure separately.
- A transaction's note field must store a null value when no note has been entered — not an empty string — to allow unambiguous querying of transactions with and without notes. `[INFERRED — verify with author]`
- Deleting a transaction that has an attached receipt must also delete the associated receipt file from storage. Orphaned receipt files must not persist after the parent transaction is removed. `[INFERRED — verify with author: confirm deletion cascade behavior]`
- Receipt attachment and notes are independent fields. Saving one must not affect the state of the other.

### 6b. Data Constraints

- Receipt files must be stored in a location accessible to the user's session and associated with the transaction's unique identifier. The storage mechanism (local device storage, cloud storage, or database blob) is not defined by these stories. `[INFERRED — verify with author: confirm receipt storage strategy]`
- The notes field must support plain text input at minimum. Rich text formatting (bold, bullet points, links) is not implied by the story and should be considered out of scope unless confirmed. `[INFERRED — verify with author]`
- If a character limit is applied to the notes field, it must be enforced consistently at both the UI layer and the data layer to prevent limit bypass through direct API calls. `[INFERRED — verify with author]`
- Receipt file metadata (filename, file size, MIME type, upload timestamp) must be stored alongside the file reference so that the detail view can display relevant file information without fetching the full file. `[INFERRED — verify with author]`

### 6c. Integration Constraints

- Story 31 implies access to platform-level file and camera APIs (camera capture, photo library picker, file system picker). Availability and permission handling varies by platform (iOS, Android, web) and must be addressed per target environment. `[INFERRED — verify with author: confirm target platforms]`
- Story 31 implies a file storage backend capable of handling binary uploads associated with transaction records. Whether this is local device storage, Supabase Storage, or another provider is not specified. `[INFERRED — verify with author]`
- If receipt files are stored remotely, the detail view must handle the case where the file is temporarily unavailable (e.g., offline) without crashing or displaying a broken state — a fallback indicator must be shown. `[INFERRED — verify with author: confirm offline behavior requirements]`

---

## 7. Success Metrics

| Feature Area       | Metric                                                                                                                 | Measurement Method               | Target                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------ |
| Receipt Attachment | Percentage of attachment actions that complete with a successfully stored and retrievable file                         | Post-upload retrieval validation | 100%                           |
| Receipt Attachment | Percentage of transaction deletions that result in zero orphaned receipt files in storage                              | Post-deletion storage audit      | 100%                           |
| Transaction Notes  | Percentage of note saves where the stored text matches the user's input exactly, with no truncation or encoding errors | Data validation audit            | 100%                           |
| Receipt Attachment | Percentage of users who attach at least one receipt within their first 30 days                                         | User-level event tracking        | `[TBD — set by product owner]` |
| Transaction Notes  | Percentage of users who add at least one note within their first 30 days                                               | User-level event tracking        | `[TBD — set by product owner]` |

---

## 8. Out of Scope

- This PRD does not cover OCR or automated data extraction from receipt images.
- This PRD does not cover receipt attachment in the export file — whether receipts are included in exports is addressed in the Transaction Export PRD.
- This PRD does not cover attaching files other than receipts (e.g., invoices, contracts) unless confirmed as in scope.
- This PRD does not cover rich text formatting in the notes field.
- This PRD does not cover searching transactions by note content — that is addressed in the Search, Filter & Sort PRD.
- This PRD does not cover sharing or forwarding individual receipts outside the app.
- This PRD does not cover receipt management as a standalone feature independent of transactions.
- This PRD does not cover versioning or history of note edits.

---

## 9. Open Questions

| #   | Question                                                                                                                                                          | Relevant Story | Impact if Unresolved                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | How many receipts can be attached per transaction — exactly one, or multiple?                                                                                     | Story 31       | Determines the data relationship — a single file reference vs. a one-to-many attachment table                |
| 2   | What file formats are accepted for receipt attachment — JPEG and PNG only, or also PDF and other document formats?                                                | Story 31       | Determines file type validation rules and whether a document viewer is needed in addition to an image viewer |
| 3   | What is the maximum allowed file size per receipt attachment?                                                                                                     | Story 31       | Determines upload validation logic and informs storage cost estimates                                        |
| 4   | Where are receipt files stored — on the device locally, in cloud storage (e.g., Supabase Storage), or both with sync?                                             | Story 31       | Core infrastructure decision that affects offline behavior, storage costs, and data portability              |
| 5   | Is there a character limit on the notes field? If so, what is it?                                                                                                 | Story 32       | Determines input validation rules and database column size                                                   |
| 6   | Should a note indicator be shown in the transaction list view to signal that a note exists, or is the note only visible in the detail view?                       | Story 32       | Affects the list view layout and whether the note field must be included in list queries                     |
| 7   | What is the expected offline behavior for receipt access — should receipts be cached locally for offline viewing, or is an offline fallback indicator sufficient? | Story 31       | Determines whether a local caching strategy is required and how storage is managed on-device                 |
