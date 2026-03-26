1. Export Data Assembly — Implement the function that queries the transaction store and assembles the export dataset as an ordered, human-readable row collection, applying the confirmed field list and excluding raw system identifiers.
2. Export Format Serializer — Implement the serializer that converts the assembled row collection into the confirmed file format (CSV, XLSX, or both), with labeled column headers and correct value formatting.
3. Export File Delivery — Implement the platform-appropriate file delivery mechanism (download, share sheet, or email attachment) that hands the serialized file to the user.
4. Full Export Action — Implement the full export trigger that invokes the assembly, serialization, and delivery pipeline for the user's complete transaction history, including the empty-history edge case.
5. Pre-Export Filter Interface — Implement the filter UI presented before a filtered export is generated, reusing existing filter logic to define the export scope.
6. Pre-Export Transaction Count Preview — Implement the count preview step that displays the number of matching transactions to the user before the filtered export file is generated.
7. Filtered Export Action — Implement the filtered export trigger that passes the active filter criteria to the assembly function and produces a scoped export file identical in structure to the full export.
8. Export Filter Metadata — Implement the recording of applied filter criteria in the exported file (filename suffix, header row, or metadata section) so the export is self-documenting.

---

## Instruction 1: Export Data Assembly

**Goal**
Implement the function that queries the transaction store at the moment of export, assembles an ordered collection of human-readable export rows from the confirmed field list, and returns it as the single dataset consumed by all downstream export instructions.

**Scope**
In scope: the query that reads the transaction store at export time, the field mapping from stored values to human-readable export values (resolving foreign keys to display names, formatting dates and amounts), the handling of reconciliation adjustment entries (include with label or exclude per confirmed behavior), and the row ordering. Out of scope: file format serialization (Instruction 2), file delivery (Instruction 3), filter application (Instruction 7), and filter metadata (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 29 third criterion: each row contains at minimum date, type, amount, category, payment method), Section 6a (no internal system identifiers or raw database values in export; all values human-readable; reconciliation entries labeled or excluded), Section 6b (date values in ISO 8601 format; amounts as plain numeric values without currency symbols; running balance per row if confirmed)

**Constraints**

- Query the transaction store at the moment the export is initiated. Records added or modified after the export is triggered must not appear in the current export — read a point-in-time snapshot if the data layer supports it, or note the limitation if not.
- Resolve all foreign key references to human-readable values at assembly time: category name from category identifier, payment method name from method identifier, transaction type label from type enum. Do not export raw identifiers.
- Format date values as ISO 8601 (YYYY-MM-DD) unless the author confirms a different format.
- Export amount as a plain numeric value with consistent decimal precision — do not embed currency symbols in the amount field.
- Reconciliation adjustment entries: include with a distinct type label or exclude entirely, per PRD Open Question 5. If unconfirmed, exclude and flag.
- PRD Open Question 3 (exact field list and whether running balance per row is included) must be confirmed before the field mapping is finalized. If unconfirmed, assemble the five minimum fields (date, type, amount, category, payment method) and flag additional fields as pending.
- The function must accept an optional filter parameter (a set of criteria) so that Instruction 7 can pass filter state into it without requiring a separate assembly function.
- When called with no filter, the function returns all transactions. When called with a filter, it returns only matching transactions. The filter application logic belongs to Instruction 7 — this function only receives and applies a pre-built predicate or filtered ID set.
- Recommended execution order: run before Instructions 2, 3, 4, and 7, which all depend on the assembled row collection.

**Expected Output**

- An assembly function that accepts the full transaction store (and an optional filter predicate) and returns an ordered array of export row objects with human-readable field values.
- Each row contains: at minimum, the five confirmed fields with correctly formatted values.
- Date fields formatted as ISO 8601.
- Amount fields as plain decimals.
- Foreign keys resolved to display names.
- Reconciliation entries handled per confirmed behavior.
- An empty array returned when no transactions match (not null or an error).

**Deliverables**

- Export data assembly function file
- Field mapping documentation (stored field → export column name and format)
- List of all files added or modified

**Preconditions**

- PRD Open Question 3 (field list and running balance) must be confirmed or defaulted to the five minimum fields with a flag.
- PRD Open Question 5 (reconciliation entries included or excluded) must be confirmed or defaulted to excluded with a flag.
- Confirm that category and payment method display names are resolvable from the transaction store query without per-row secondary fetches (cross-reference Transaction Categories PRD Instruction 5 and Payment Method PRD Instruction 5 for the established join patterns).
- Cross-reference Balance Management PRD Instruction 1 if running balance per row is confirmed — the balance computation function must be available before it can be applied row-by-row.

**Open Questions**

- PRD Open Question 3: What is the exact field list? Is running balance per row included? Without this, the field mapping is provisional.
- PRD Open Question 5: Are reconciliation adjustment entries included in the export, and if so, what label do they carry?

---

## Instruction 2: Export Format Serializer

**Goal**
Implement the serializer that converts the assembled row collection from Instruction 1 into the confirmed export file format, producing a file with labeled column headers and correctly formatted values ready for delivery.

**Scope**
In scope: the serialization of the row array into the confirmed format (CSV, XLSX, or both), the column header row, and any format-specific encoding requirements. Out of scope: the data assembly (Instruction 1), file delivery (Instruction 3), filter logic (Instruction 7), and filter metadata in the file (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 29 second criterion: every transaction as a separate row with field values in labeled columns; file openable in standard tools without transformation), Section 6a (file must not require transformation, decoding, or proprietary software), Section 6b (date and amount formatting already applied by Instruction 1 — serializer must not reformat)

**Constraints**

- Implement only the confirmed format(s) from PRD Open Question 1. Do not build XLSX support if only CSV is confirmed, or vice versa. If multiple formats are confirmed, implement a format selector parameter.
- The first row of the output file must be a header row with human-readable column names matching the field mapping from Instruction 1.
- Do not re-format date or amount values — they arrive pre-formatted from Instruction 1. The serializer's job is structure, not transformation.
- For CSV: values containing commas, quotes, or newlines must be correctly escaped per RFC 4180.
- For XLSX: confirm whether a third-party library is already present in the codebase before introducing one. If none is present, document the library choice as an assumption and flag for author confirmation.
- The serializer must accept the row array from Instruction 1 and return a file blob, buffer, or equivalent in-memory representation — do not write directly to disk or trigger delivery from this function.
- Recommended execution order: run after Instruction 1 confirms the row structure and field names. Run before Instructions 3, 4, and 7.

**Expected Output**

- A serializer function that accepts a row array and a format identifier and returns a file blob or buffer.
- A header row derived from the field mapping in Instruction 1.
- For CSV: RFC 4180-compliant output.
- For XLSX: a valid workbook with one sheet containing the header and data rows.
- An empty input (zero-row array) produces a file with only the header row — not an error.

**Deliverables**

- Export format serializer function file
- Header row definition (column names in order)
- Library choice documented if XLSX is confirmed (existing or newly introduced)
- List of all files added or modified

**Preconditions**

- PRD Open Question 1 (export format: CSV, XLSX, or both) must be confirmed before this instruction is implemented.
- Instruction 1 must define the row structure and column names before the header row is written.
- If XLSX is confirmed, confirm whether a spreadsheet generation library is already present in the codebase.

**Open Questions**

- PRD Open Question 1: What export format(s) are supported? This is the primary decision for this instruction — CSV requires no library; XLSX requires one.

---

## Instruction 3: Export File Delivery

**Goal**
Implement the platform-appropriate mechanism that delivers the serialized export file to the user — download (web), share sheet (mobile), or email attachment — after the file blob or buffer is produced by Instruction 2.

**Scope**
In scope: the delivery trigger that receives the file blob or buffer from Instruction 2 and initiates the platform-native delivery flow, and any filename construction logic (including format suffix and optional filter metadata suffix per Instruction 8). Out of scope: file serialization (Instruction 2), data assembly (Instruction 1), and filter metadata content (Instruction 8 — this instruction only appends what Instruction 8 provides to the filename).

**Inputs**

- Full codebase
- PRD Section 5 (Story 29 fifth criterion: file immediately openable without transformation; delivery mechanism — download, share sheet, or email), Section 6c (platform-native share sheet, direct download, or email attachment depending on target platform)

**Constraints**

- Use the platform's native delivery mechanism — do not implement a custom file transfer layer.
- The filename must include the export format extension and a timestamp indicating when the export was generated (e.g., `transactions_2026-03-26.csv`). Confirm the filename convention with the author or use this pattern as a default and flag.
- Do not embed the file blob construction or data assembly in this function — receive the blob from Instruction 2 and deliver it.
- If the platform is mobile and a share sheet is used, confirm the share sheet API available in the codebase before implementing.
- If email delivery is confirmed, confirm whether the codebase has an existing email or mailto integration before building one.
- PRD Open Question 2 (delivery mechanism per platform) must be confirmed before implementing — the mechanism differs significantly between web download and mobile share sheet.
- Recommended execution order: run after Instruction 2 defines the file blob interface. Run before Instructions 4 and 7 which invoke the full pipeline.

**Expected Output**

- A delivery function that accepts a file blob or buffer and a filename, and initiates the platform-native delivery flow.
- On web: triggers a browser download.
- On mobile: opens the platform share sheet with the file attached.
- On email (if confirmed): composes an email with the file as an attachment.
- The filename includes the format extension and a generation timestamp.

**Deliverables**

- Export file delivery function file
- Filename construction logic
- List of all files added or modified

**Preconditions**

- PRD Open Question 2 (delivery mechanism per platform) must be confirmed before this instruction is implemented.
- Confirm the platform(s) targeted by the codebase before choosing the delivery API.

**Open Questions**

- PRD Open Question 2: What is the delivery mechanism per platform? Web download, mobile share sheet, and email attachment each require a different implementation.

---

## Instruction 4: Full Export Action

**Goal**
Implement the full export trigger that invokes the assembly, serialization, and delivery pipeline for the user's complete transaction history, handles the empty-history edge case, and presents no filter interface.

**Scope**
In scope: the export action trigger (button or menu item), the pipeline invocation (assembly with no filter → serializer → delivery), the empty-history edge case (empty file with headers or informational message), and the loading state during generation. Out of scope: filter interface (Instruction 5), count preview (Instruction 6), filter metadata (Instruction 8), and the assembly/serialization/delivery functions themselves (Instructions 1, 2, 3).

**Inputs**

- Full codebase
- PRD Section 5 (Story 29 acceptance criteria: full export produces every transaction; empty history produces empty file with headers or informs user; file immediately openable)

**Constraints**

- Pass no filter to the assembly function — the full export includes every transaction.
- On empty history: produce a file with only the header row, or display an informational message to the user before generating. Do not fail silently. Confirm the preferred empty-history behavior with the author; if unconfirmed, produce the header-only file and flag.
- Display a loading indicator while the pipeline runs — export generation may take time for large histories.
- Do not re-implement assembly, serialization, or delivery — call the functions from Instructions 1, 2, and 3 in sequence.
- Recommended execution order: run after Instructions 1, 2, and 3 define the pipeline functions.

**Expected Output**

- An export action trigger accessible from the transaction history screen or a settings/export screen.
- Pipeline invocation: assembly (no filter) → serializer → delivery.
- Loading state displayed during generation.
- Empty history: header-only file produced or user informed — not a silent failure.

**Deliverables**

- Export action trigger component or handler
- Pipeline invocation sequence
- Empty-history edge case handling
- List of all files added or modified

**Preconditions**

- Instructions 1, 2, and 3 must define their respective function interfaces before this instruction wires them together.
- Confirm where the full export action is accessible in the UI (transaction history screen, settings screen, or a dedicated export screen).

---

## Instruction 5: Pre-Export Filter Interface

**Goal**
Implement the filter UI presented before a filtered export is generated, allowing the user to define the export scope by selecting at least one filter criterion, reusing the existing filter logic from the transaction list view.

**Scope**
In scope: the pre-export filter interface (screen, modal, or inline controls), the filter dimensions available for export scope definition, and the mechanism that passes the resulting filter criteria to the filtered export action (Instruction 7). Out of scope: the filter logic implementation itself (reuse from Search, Filter & Sort PRD), the export pipeline (Instructions 1–4), the count preview (Instruction 6), and filter metadata recording (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 30 first criterion: user can define at least one filter criterion before export; fifth criterion: filtered export uses same format and column structure as full export), Section 6a (filtered export must apply filter logic consistently with the transaction list view), Section 6c (export filter interface either reuses existing filter controls or provides a dedicated pre-export filter step — reuse preferred)

**Constraints**

- Reuse the filter logic from the Search, Filter & Sort PRD — do not reimplement filter criteria matching. The pre-export filter interface is a presentation layer over existing filter functionality.
- Implement only the filter dimensions confirmed for export by PRD Open Question 4. Do not add export-specific filter dimensions not present in the transaction list filter.
- Clearing all filter criteria in this interface must revert to full-export behavior — all transactions included.
- The filter state produced by this interface is passed to Instruction 7's export action — define the handoff interface clearly.
- Do not trigger the export from within this interface — it presents filter options and passes criteria out; Instruction 7 triggers the export.
- Recommended execution order: run after confirming the filter dimensions (PRD Open Question 4) and after the Search, Filter & Sort PRD filter controls are available for reuse. Run before Instruction 7.

**Expected Output**

- A pre-export filter interface presenting the confirmed filter dimensions.
- The user can select one or more filter criteria.
- Clearing all criteria produces an empty filter state equivalent to no filter.
- The active filter state is passed to the export action trigger (Instruction 7) when the user proceeds to generate the export.

**Deliverables**

- Pre-export filter interface component file
- Filter state handoff interface documented for Instruction 7
- List of all files added or modified

**Preconditions**

- PRD Open Question 4 (filter dimensions for export) must be confirmed before the filter interface is built.
- Confirm that the filter logic from the Search, Filter & Sort PRD is available as a reusable module before building the pre-export UI on top of it.

**Open Questions**

- PRD Open Question 4: Which filter dimensions are available for filtered export — date range, category, payment method, transaction type, or others?

---

## Instruction 6: Pre-Export Transaction Count Preview

**Goal**
Implement the count preview step that queries the matching transaction count for the active filter criteria and displays it to the user before the export file is generated.

**Scope**
In scope: the count query run against the active filter state from Instruction 5, the display of the matching count to the user, and the user action to proceed with or cancel the export after reviewing the count. Out of scope: the filter interface itself (Instruction 5), the export pipeline execution (Instruction 7), and the empty-filter-result edge case handling beyond displaying a count of zero.

**Inputs**

- Full codebase
- PRD Section 5 (Story 30 fourth criterion: number of transactions to be included is displayed before the file is generated)

**Constraints**

- This instruction is conditional on PRD Open Question 6 confirming the count preview is required. If unconfirmed, implement it and flag as an assumption — it is stated in the Story 30 acceptance criteria and removing it later is lower risk than omitting it.
- Run the count query using the same filter predicate produced by Instruction 5 — do not reimplement filter matching here.
- Display the count before any file generation begins — do not generate the file and then display the count.
- If the count is zero: display the zero count and inform the user that no transactions match the selected criteria. Do not generate an export file if the user proceeds from a zero-count state without confirmation — confirm the preferred zero-count behavior with the author.
- The count display must be followed by a proceed/cancel action. Proceeding passes the filter state to Instruction 7; cancelling returns the user to the filter interface without generating a file.
- Recommended execution order: run after Instruction 5 defines the filter state output and before Instruction 7 triggers the export.

**Expected Output**

- A count query that accepts the active filter predicate and returns the matching transaction count.
- A count preview display showing the number of transactions to be exported.
- Proceed and cancel actions following the count display.
- Zero-count state handled: user informed, no silent generation of an empty file unless confirmed.

**Deliverables**

- Count query function
- Count preview display component or inline markup
- Proceed/cancel action wiring
- List of all files added or modified

**Preconditions**

- Instruction 5 must define the filter state interface before this instruction queries against it.
- Confirm the preferred zero-count behavior (generate empty file with headers, or block generation and inform the user) before implementing the zero-count path.

**Open Questions**

- PRD Open Question 6: Is the pre-export count preview confirmed as required? The acceptance criteria include it as inferred — author confirmation removes the flag.

---

## Instruction 7: Filtered Export Action

**Goal**
Implement the filtered export trigger that receives the active filter criteria from Instruction 5, passes them to the assembly function to produce a scoped row collection, serializes and delivers the file, and handles the case where all filters are cleared (equivalent to a full export).

**Scope**
In scope: the filtered export trigger, the pipeline invocation (assembly with filter → serializer → delivery), the cleared-filter path (no transactions excluded), and the zero-result path (empty file with headers or informational message). Out of scope: the filter interface (Instruction 5), the count preview (Instruction 6), filter metadata recording in the file (Instruction 8), and the pipeline function implementations (Instructions 1, 2, 3).

**Inputs**

- Full codebase
- PRD Section 5 (Story 30 acceptance criteria: only matching transactions in the file; same format and column structure as full export; cleared filters equivalent to full export; zero-match produces empty file with headers or informs user)

**Constraints**

- Pass the active filter criteria to the assembly function from Instruction 1 as a filter parameter — do not duplicate assembly or filter logic here.
- When all filter criteria are cleared, the assembly function receives no filter and returns all transactions — the resulting file is equivalent to a full export.
- On zero matching transactions: produce a header-only file or inform the user, consistent with the behavior defined in Instruction 4 for the empty-history case.
- The output file must use the same column structure and format as the full export — no format differences between full and filtered exports.
- Do not re-implement assembly, serialization, or delivery — call the functions from Instructions 1, 2, and 3 in sequence with the filter parameter added.
- Recommended execution order: run after Instructions 1, 2, 3, 5, and 6 are complete.

**Expected Output**

- A filtered export trigger that accepts the active filter state from Instruction 5 (via Instruction 6's proceed action) and invokes the pipeline.
- Assembly called with the active filter → serializer → delivery.
- Cleared-filter path: no filter passed to assembly; all transactions included.
- Zero-result path: header-only file or informational message, consistent with full export empty-history behavior.
- Output file uses the same column structure as the full export.

**Deliverables**

- Filtered export trigger handler
- Pipeline invocation sequence showing filter parameter threading
- Zero-result path handling
- List of all files added or modified

**Preconditions**

- Instructions 1, 2, and 3 must define their function interfaces, particularly Instruction 1's optional filter parameter, before this instruction wires them together.
- Instruction 5 must define the filter state output interface before this instruction receives it.
- Instruction 6 must define the proceed action that passes control and filter state to this instruction.

---

## Instruction 8: Export Filter Metadata

**Goal**
Implement the recording of applied filter criteria in the exported file — as a filename suffix, a header row, or a metadata section — so the filtered export is self-documenting and identifiable after leaving the app.

**Scope**
In scope: the filter criteria summary formatted for inclusion in the filename and/or the file content, the logic that constructs the summary from the active filter state, and the handoff to Instruction 3's delivery function (filename) and Instruction 2's serializer (file content metadata, if confirmed). Out of scope: the filter interface (Instruction 5), the serializer implementation (Instruction 2), the delivery function implementation (Instruction 3), and any metadata for full exports (which have no filter to record).

**Inputs**

- Full codebase
- PRD Section 6b (applied filter criteria must be recorded in the filename, a header row, or a separate metadata section so the user can identify the export scope when reviewing the file later)

**Constraints**

- This instruction is conditional on PRD Open Question 7 confirming filter metadata is required. PRD Section 6b states it is required — treat this as confirmed and flag if the author later reverses it.
- Apply metadata only to filtered exports — full exports have no filter criteria to record.
- Filename suffix: append a human-readable summary of the active filter criteria to the filename before the extension (e.g., `transactions_category-food_2026-03-26.csv`). Keep the suffix concise — do not produce an excessively long filename.
- File content metadata: if a header row or metadata section is confirmed, record the filter criteria in a format that does not disrupt the column structure expected by spreadsheet tools. A pre-data metadata block (rows before the header row labeled with a comment character or empty leading column) is one pattern — confirm the preferred approach with the author.
- Do not modify the assembly row structure — metadata is appended around the data rows, not embedded within them.
- Recommended execution order: run after Instruction 5 defines the filter state output and after Instructions 2 and 3 expose the interfaces for injecting metadata into the file content and filename.

**Expected Output**

- A metadata construction function that accepts the active filter state and returns a human-readable summary string suitable for use in a filename.
- The filename suffix appended by Instruction 3's delivery function when the export is filtered.
- If in-file metadata is confirmed: a metadata block or header rows prepended to the serialized file by Instruction 2's serializer, recording the filter criteria without disrupting the column structure.

**Deliverables**

- Filter metadata construction function
- Updated filename construction in Instruction 3's delivery function to include the filter summary suffix
- In-file metadata block implementation (if confirmed), integrated with Instruction 2's serializer
- List of all files added or modified

**Preconditions**

- PRD Open Question 7 (metadata in filename, header row, or both) must be confirmed — the preferred recording location determines where the metadata is injected.
- Instruction 5 must define the filter state structure before the metadata construction function can serialize it to a human-readable summary.
- Instruction 3 must expose a filename parameter interface before this instruction appends a suffix to it.
- Instruction 2 must expose an optional metadata injection point before this instruction adds in-file metadata.

**Open Questions**

- PRD Open Question 7: Where should filter criteria be recorded — filename suffix, in-file header rows, or both? The implementation location differs significantly between the three options.
