1. Transaction Notes Schema — Add the nullable notes field to the transaction record schema, enforcing null (not empty string) for absent notes at the data layer.
2. Transaction Notes UI — Implement the notes input field in the transaction entry and edit forms, the notes display in the detail view, and the note-present indicator in the list view.
3. Receipt Attachment Schema — Define the receipt attachment data model (single reference or one-to-many table per confirmed attachment count), storing file metadata alongside the file reference.
4. Receipt Storage Integration — Implement the file upload and retrieval integration with the confirmed storage backend, including file size and format validation before upload.
5. Receipt Attachment UI — Implement the attachment controls in the transaction entry and edit forms, the receipt preview and indicator in the detail view, and the absence-neutral state in the list view.
6. Receipt Deletion Cascade — Implement the cascade that deletes associated receipt files from storage when a transaction is deleted, ensuring no orphaned files remain.
7. Receipt Offline Fallback — Implement the fallback indicator shown in the detail view when a remotely stored receipt file is temporarily unavailable.

---

## Instruction 1: Transaction Notes Schema

**Goal**
Add the nullable notes field to the transaction record schema, enforcing a null value (not an empty string) for transactions with no note entered, and document the field name and type for all downstream instructions.

**Scope**
In scope: the notes field addition to the transaction record schema, the null constraint rule, the data-layer enforcement that an empty string is converted to or rejected in favor of null, and the migration if required. Out of scope: the notes UI (Instruction 2), receipt schema (Instruction 3), and all other transaction fields.

**Inputs**

- Full codebase
- PRD Section 6a (notes field must store null when no note entered — not empty string; allows unambiguous querying of noted vs. unnoted transactions), Section 6b (plain text only; character limit enforced at data layer if confirmed)

**Constraints**

- The field must be nullable — do not assign a default empty string.
- If a character limit is confirmed (PRD Open Question 5), apply it as a column-level constraint in addition to UI enforcement. If unconfirmed, leave the column unbounded and flag.
- Do not modify any other transaction fields — this instruction touches only the notes column addition.
- Use the schema naming convention established in the existing transaction schema (cross-reference Transaction Entry PRD Instruction 9).
- Do not implement any UI or form logic here — schema and reference document only.
- Recommended execution order: run before Instruction 2.

**Expected Output**

- Updated transaction record schema with a nullable plain-text notes field.
- If a character limit is confirmed: column-level constraint applied.
- Null-not-empty-string rule documented as a constraint comment or schema annotation.
- Before/after schema comparison and migration file if the codebase uses migrations.

**Deliverables**

- Updated schema file with the notes field
- Migration file or script
- Field reference entry: field name, type, required/optional, description
- List of all files added or modified

**Preconditions**

- PRD Open Question 5 (character limit and its value) must be confirmed or defaulted to unbounded with a flag before the column constraint is written.
- Confirm the transaction schema file location and ORM convention from Transaction Entry PRD Instruction 9 output before modifying it.

**Open Questions**

- PRD Open Question 5: Is there a character limit on the notes field, and what is it? A confirmed limit requires a column-level constraint in addition to the UI enforcement in Instruction 2.

---

## Instruction 2: Transaction Notes UI

**Goal**
Implement the notes input field in the transaction entry and edit forms, the full-content notes display in the detail view, the note-present indicator in the transaction list view, and the null write when the notes field is cleared or left empty.

**Scope**
In scope: the notes textarea or input in the entry and edit forms, the character count indicator and input restriction if a limit is confirmed, the null write on save when the field is empty, the pre-populated notes value in the edit form, the full non-truncated notes display in the detail view, the note-present indicator in the list row (if confirmed), and the visually neutral absence state. Out of scope: the notes schema (Instruction 1), receipt UI (Instruction 5), and rich text formatting (out of scope per PRD Section 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 32 acceptance criteria), Section 6a (null stored when no note; empty string not acceptable), Section 6b (plain text; character limit enforced at UI layer if confirmed; null vs. empty string handling)

**Constraints**

- On save with an empty or whitespace-only notes field, write null to the notes column — do not write an empty string.
- On save with text content, write the entered text as-is (plain text, no formatting).
- If a character limit is confirmed (PRD Open Question 5), show a character count indicator as the user approaches the limit and prevent saving when the limit is exceeded. Match the limit value confirmed in Instruction 1.
- The detail view must display the full note without truncation.
- The list view must show a note-present indicator (icon or equivalent) without displaying note content, if confirmed (PRD Open Question 6). If unconfirmed, implement the indicator and flag.
- The absence of a note must be visually neutral in both list and detail views — no empty placeholder text or missing-field indicator.
- The edit form must pre-populate the notes field with the currently stored value (including null → empty input).
- Do not modify the notes schema — read the field name from Instruction 1's output.
- Recommended execution order: run after Instruction 1 confirms the field name and character limit.

**Expected Output**

- Notes input in the entry form: textarea with optional character count, null write on empty submit.
- Notes input in the edit form: pre-populated from stored value, null write if cleared.
- Detail view: full note content displayed, no truncation, neutral display when null.
- List row: note-present indicator when note is non-null, no indicator when null.

**Deliverables**

- Updated transaction entry form component
- Updated transaction edit form component
- Updated transaction detail view component
- Updated transaction list row component (note indicator)
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the notes field name before this instruction writes to it.
- PRD Open Question 5 (character limit) must be confirmed before the character count and input restriction are implemented.
- PRD Open Question 6 (note indicator in list view) must be confirmed or defaulted to implemented with a flag.

**Open Questions**

- PRD Open Question 6: Should a note-present indicator appear in the list view? If confirmed, the list query must include the notes field (or a boolean derived from it) so the indicator can be driven without a secondary fetch.

---

## Instruction 3: Receipt Attachment Schema

**Goal**
Define and implement the receipt attachment data model — either a single file reference field on the transaction record or a one-to-many attachment table — storing file metadata (filename, size, MIME type, upload timestamp) alongside the file reference, as the authoritative schema for all receipt instructions.

**Scope**
In scope: the attachment schema (single-reference field or separate attachment entity per confirmed count), the file metadata fields, the association to the transaction record by identifier, and the migration. Out of scope: the storage backend integration (Instruction 4), the attachment UI (Instruction 5), deletion cascade (Instruction 6), and offline fallback (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 6b (receipt file metadata — filename, file size, MIME type, upload timestamp — stored alongside the file reference; storage mechanism unspecified), Section 6a (deleting a transaction must cascade to receipt files; orphaned files must not persist)

**Constraints**

- PRD Open Question 1 (one receipt per transaction vs. multiple) is the primary structural decision. If one: add a nullable file reference field and metadata columns directly to the transaction record. If multiple: create a separate attachment entity with a foreign key to the transaction. If unconfirmed, implement a one-to-many attachment table and flag — it is the safer default that accommodates both cases.
- The file reference field must store the storage location identifier or URL, not the binary file content.
- Metadata fields required: original filename, file size (bytes), MIME type, upload timestamp. Do not fabricate additional fields.
- The association to the transaction must use the transaction's confirmed unique identifier field.
- Do not implement any UI, upload logic, or deletion cascade here — schema and reference document only.
- Recommended execution order: run before Instructions 4, 5, and 6.

**Expected Output**

- The receipt attachment schema: field names, types, nullability, constraints, and the association to the transaction record.
- Flat reference table: entity name, field name, type, required/optional, description.
- Before/after comparison and migration file if modifying the transaction record schema directly.

**Deliverables**

- New attachment entity schema file or updated transaction record schema
- Migration file or script
- Flat reference table
- List of all files added or modified

**Preconditions**

- PRD Open Question 1 (single vs. multiple receipts) must be confirmed or defaulted to one-to-many with a flag.
- Confirm the transaction record's unique identifier field name from Transaction Entry PRD Instruction 9 before writing the foreign key reference.

**Open Questions**

- PRD Open Question 1: One receipt per transaction or multiple? This determines the entire schema structure for this instruction.

---

## Instruction 4: Receipt Storage Integration

**Goal**
Implement the file upload function that stores an attachment file in the confirmed storage backend, validates file size and format before uploading, and returns a storage reference and metadata object for persistence by the attachment schema.

**Scope**
In scope: the upload function, the file size validation (reject before upload if exceeded), the MIME type / file format validation (reject before upload if unsupported), the storage write, and the returned storage reference and metadata. Out of scope: the attachment schema (Instruction 3), the UI that initiates the upload (Instruction 5), the deletion cascade (Instruction 6), and the offline fallback (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 5 (Story 31: size limit rejection does not block transaction save; format rejection at attachment time), Section 6a (attachment failure must not block transaction save), Section 6b (file metadata stored alongside file reference), Section 6c (storage backend unspecified — Supabase Storage or equivalent)

**Constraints**

- Validate file size before initiating the upload. If the file exceeds the confirmed maximum (PRD Open Question 3), reject with an error message stating the limit. Do not begin the upload for oversized files.
- Validate MIME type or file extension before upload against the confirmed accepted formats (PRD Open Question 2). Reject unsupported formats with an error identifying the accepted types. Do not begin the upload for invalid formats.
- The upload function must be decoupled from the transaction save — a upload failure must not cause the transaction save to fail. Return the error to the caller (Instruction 5) so it can be surfaced to the user independently.
- Return a storage reference (URL, path, or identifier) and a metadata object (filename, file size, MIME type, upload timestamp) on success — these are written to the attachment schema by Instruction 5.
- Do not write to the attachment schema here — return the reference and metadata and let Instruction 5 handle the persistence.
- Use the storage provider already established in the codebase (cross-reference Supabase Storage or equivalent). Do not introduce a new storage provider.
- Recommended execution order: run after Instruction 3 defines the metadata structure expected by the schema. Run before Instruction 5.

**Expected Output**

- An upload function that accepts a file and returns `{ storageReference, metadata }` on success or an error object on failure.
- File size validation before upload: error returned if exceeded.
- MIME type / format validation before upload: error returned if unsupported.
- The upload function can fail independently of the transaction save — the caller handles both outcomes separately.

**Deliverables**

- Receipt upload function file
- Size validation logic with the confirmed limit as a named constant
- Format validation logic with the confirmed accepted types as a named list
- List of all files added or modified

**Preconditions**

- PRD Open Question 2 (accepted file formats) must be confirmed before the format validation list is written.
- PRD Open Question 3 (maximum file size) must be confirmed before the size validation constant is set.
- PRD Open Question 4 (storage backend) must be confirmed before the upload implementation targets a specific provider.
- Instruction 3 must define the metadata structure before this instruction constructs and returns it.

**Open Questions**

- PRD Open Question 2: What file formats are accepted — JPEG, PNG, PDF, others?
- PRD Open Question 3: What is the maximum allowed file size per attachment?
- PRD Open Question 4: Where are receipt files stored — local device, Supabase Storage, or another provider?

---

## Instruction 5: Receipt Attachment UI

**Goal**
Implement the attachment controls in the transaction entry and edit forms (camera, photo library, file picker per confirmed sources), the receipt preview and indicator in the detail view, the replace behavior, and the visually neutral absent-attachment state in the list view.

**Scope**
In scope: the attachment picker trigger in the entry and edit forms, the platform file/camera API integration, the file selection flow, the upload invocation (delegating to Instruction 4), the storage reference and metadata write to the attachment schema, the receipt preview and attachment indicator in the detail view, the replace flow (new file replaces old, old reference removed), and the neutral absent-attachment state. Out of scope: the upload function itself (Instruction 4), the attachment schema (Instruction 3), the deletion cascade on transaction delete (Instruction 6), and the offline fallback (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 5 (Story 31 acceptance criteria), Section 6a (attachment failure does not block transaction save; orphaned files must not persist on replace), Section 6c (platform file and camera API access; permission handling per platform)

**Constraints**

- The attachment picker must offer the confirmed source options (camera, photo library, file picker — per PRD Open Question 1 of this PRD's platform context — cross-reference PRD Section 5 Story 31 first criterion). Implement only the confirmed sources.
- After the user selects a file, invoke the upload function from Instruction 4. On upload success, write the returned storage reference and metadata to the attachment schema. On upload failure, surface the error to the user without blocking the transaction save.
- Replace behavior: when the user selects a new file for a transaction that already has an attachment, delete the previous storage reference and file before writing the new one. No orphaned file may remain after a replace.
- The detail view must show a visible indicator that a receipt is attached, and allow the user to open or preview the file without leaving the transaction context.
- The absent-attachment state in the list and detail views must be visually neutral — no broken indicator or empty slot shown.
- Request platform permissions (camera, photo library, file access) per the conventions already established in the codebase. Do not introduce a new permissions library.
- Recommended execution order: run after Instructions 3 and 4 define the schema and upload function.

**Expected Output**

- Attachment picker trigger in the entry and edit forms, opening the confirmed source options.
- On file selection: upload invoked; on success, reference and metadata written to schema; on failure, error surfaced independently of transaction save.
- Replace flow: old reference and file deleted; new reference and metadata written.
- Detail view: attachment indicator and file preview accessible without navigation away.
- List view and detail view: neutral state when no attachment exists.

**Deliverables**

- Updated transaction entry form component (attachment picker and upload invocation)
- Updated transaction edit form component (replace flow and upload invocation)
- Updated transaction detail view component (indicator and preview)
- Updated transaction list row component (neutral absent state — no indicator)
- List of all files added or modified

**Preconditions**

- Instruction 3 must define the attachment schema field names before this instruction writes to them.
- Instruction 4 must define the upload function's interface (input: file; output: `{ storageReference, metadata }` or error) before this instruction calls it.
- Confirm the platform file, camera, and photo library APIs available in the codebase before implementing the picker.
- PRD Open Question 1 (single vs. multiple receipts) — if multiple, the UI must support adding additional files rather than replacing; confirm before building the picker flow.

---

## Instruction 6: Receipt Deletion Cascade

**Goal**
Implement the cascade that deletes all associated receipt files from storage and removes their attachment records when a transaction is deleted, ensuring no orphaned files or metadata records remain after deletion.

**Scope**
In scope: the cascade logic triggered when a transaction is deleted (single delete and bulk delete), the storage file deletion for each associated attachment, the attachment record deletion from the schema, and the orphan check. Out of scope: the transaction delete logic itself (Transaction Management PRD), the upload function (Instruction 4), and the attachment UI (Instruction 5).

**Inputs**

- Full codebase
- PRD Section 6a (deleting a transaction must also delete associated receipt files; orphaned files must not persist after parent transaction removal)

**Constraints**

- The cascade must fire for both single-transaction delete and bulk delete — audit both delete paths from the Transaction Management PRD and confirm each triggers the cascade.
- Delete storage files before or alongside attachment record deletion — do not delete the schema record while leaving the storage file, or vice versa.
- If a storage file deletion fails, surface the error and log it — do not silently pass. The transaction deletion may still complete, but the orphaned file must be flagged for cleanup.
- For bulk delete: delete all associated attachments for all selected transactions, not just the first.
- Do not modify the transaction delete handlers — hook into them via the established cascade or post-delete event pattern in the codebase.
- Recommended execution order: run after Instructions 3 and 4 confirm the attachment schema structure and storage provider. Cross-reference Transaction Management PRD Instruction 3 (single delete) and Instruction 9 (bulk delete) for the delete hook points.

**Expected Output**

- A cascade function or hook that fires on transaction deletion, reads all attachment records for the deleted transaction(s), deletes each file from storage, and removes the attachment records from the schema.
- Bulk delete path: iterates all deleted transaction identifiers and cascades each.
- Storage deletion failure: error surfaced and logged; orphaned file flagged.
- Post-cascade: zero attachment records and zero storage files associated with the deleted transaction(s).

**Deliverables**

- Deletion cascade function or hook file
- Integration points in single-delete and bulk-delete handlers
- Orphaned file error handling and logging
- List of all files added or modified

**Preconditions**

- Instruction 3 must define the attachment schema and its association to the transaction identifier before the cascade query is written.
- Instruction 4 must define the storage provider's file deletion API before this instruction calls it.
- Cross-reference Transaction Management PRD Instructions 3 and 9 for the delete handler hook points before wiring the cascade.

---

## Instruction 7: Receipt Offline Fallback

**Goal**
Implement the fallback indicator displayed in the transaction detail view when a remotely stored receipt file is temporarily unavailable, preventing a broken or crashed state when the file cannot be fetched.

**Scope**
In scope: the availability check or error handler on receipt file fetch in the detail view, the fallback indicator rendered when the file is unavailable, and the recovery behavior when connectivity is restored. Out of scope: local receipt caching for offline access (see Open Questions), the upload function (Instruction 4), the attachment schema (Instruction 3), and the detail view's non-receipt content (Instruction 5).

**Inputs**

- Full codebase
- PRD Section 6c (if receipt files stored remotely, detail view must handle temporary unavailability without crashing or broken state; a fallback indicator must be shown)

**Constraints**

- This instruction applies only if PRD Open Question 4 confirms remote storage. If local-only storage is confirmed, this instruction is void — flag and halt.
- The fallback indicator must replace the receipt preview in the detail view when the file fetch fails or times out — do not show a broken image or a blank space.
- The fallback must not prevent the rest of the detail view from rendering — the transaction's other fields must display normally regardless of receipt availability.
- Do not implement local caching of receipt files unless PRD Open Question 7 confirms it is required. If caching is required, it is a separate instruction — this instruction covers only the fallback indicator.
- Use the error handling and retry pattern already established in the codebase for remote resource fetches.
- Recommended execution order: run after Instruction 5 establishes the receipt preview component in the detail view.

**Expected Output**

- An error handler on the receipt file fetch that catches fetch failures and renders a fallback indicator (e.g., a placeholder with a "Receipt unavailable" label or an offline icon).
- The fallback indicator replaces the preview without disrupting the rest of the detail view.
- When the file becomes available again (connectivity restored), the preview loads normally on next view or retry.

**Deliverables**

- Updated receipt preview component with fetch error handler and fallback indicator
- List of all files added or modified

**Preconditions**

- PRD Open Question 4 (remote vs. local storage) must be confirmed as remote before this instruction runs. If local, halt.
- PRD Open Question 7 (offline caching strategy) must be reviewed — if local caching is required, a separate instruction is needed before this one, since a cached file would prevent the fallback from being reached.
- Instruction 5 must establish the receipt preview component before this instruction adds the error handler to it.

**Open Questions**

- PRD Open Question 7: Should receipts be cached locally for offline viewing, or is a fallback indicator sufficient? If local caching is required, it must be implemented as a prerequisite to this instruction — a cached file eliminates the offline fallback scenario.
