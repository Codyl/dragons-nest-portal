# Requirements Document

## Introduction

The Child Accounts settings page gives adult household users a dedicated place
to manage their `householdStudentDrafts` — the same student profiles that
already appear in the sidebar's student selector. From this page an adult can
see all their students at a glance, add new ones, and archive existing ones
(soft-delete: data is retained and can be restored at any time).

The page lives at `/settings/child-accounts` and integrates into the existing
settings shell layout. The backend is a NestJS app; the frontend is a TanStack
Router React app. `GET /profile` exposes a dedicated **`householdStudentDraftsAll`**
payload field for adults (every draft, including archived) while the existing
**`householdStudents`** field remains active-only for the sidebar. Archiving uses
a soft-delete pattern: an `archivedAt` timestamp is added to the student draft
record rather than removing it from the array. Archived students are hidden from
the sidebar student selector but remain visible (and restorable) on this
settings page.

---

## Glossary

- **Adult_User**: An authenticated user whose `accountType` is `adult` and whose
  `ageBandAtRegistration` is `ADULT_18_PLUS`, consistent with the Child Accounts
  route guard and Profile_API adult-only mutations.
- **Child_Accounts_Page**: The settings sub-page at `/settings/child-accounts`
  introduced by this feature.
- **Settings_Shell**: The shared settings layout component
  (`_private.settings.tsx`) that renders the sidebar and an `<Outlet />` for
  nested settings routes.
- **Student_Draft**: An entry in the adult user's `householdStudentDrafts`
  array, with fields `studentDraftId` (string), `displayName` (string),
  `currentGrade` (number, 0–13), `lastPromotionYear` (number), and optionally
  `archivedAt` (Date or null).
- **Active_Student_Draft**: A Student_Draft whose `archivedAt` field is `null`
  or absent.
- **Archived_Student_Draft**: A Student_Draft whose `archivedAt` field is a
  non-null Date value.
- **Add_Student_Form**: The inline form or sheet used to create a new
  Student_Draft.
- **Archive_Action**: The UI control that soft-deletes a Student_Draft by
  setting its `archivedAt` timestamp.
- **Restore_Action**: The UI control that un-archives an Archived_Student_Draft
  by clearing its `archivedAt` timestamp.
- **Profile_API**: The NestJS backend controller at `/profile` that manages user
  data.
- **Student_Selector**: The existing sidebar component that reads
  `householdStudents` from the `['user', 'me']` query and lets the adult switch
  into a student's view.
- **Household_Student_Drafts_All**: The `householdStudentDraftsAll` field on the
  `GET /profile` payload for an Adult_User — the full list of student drafts
  (active and archived), each including `archivedAt`, used exclusively by the
  Child_Accounts_Page to render both sections.

---

## Requirements

### Requirement 1: Page Access and Route Setup

**User Story:** As an Adult_User, I want a dedicated settings page for managing
my child accounts, so that I can find and update my household students without
leaving the settings area.

#### Acceptance Criteria

1. WHEN an Adult_User navigates to `/settings/child-accounts`, THE
   Settings_Shell SHALL render the Child_Accounts_Page within the settings
   sidebar layout.
2. WHEN a non-adult authenticated user navigates to `/settings/child-accounts`,
   THE Child_Accounts_Page SHALL redirect the user to `/settings/profile`.
3. WHEN an unauthenticated user navigates to `/settings/child-accounts`, THE
   Child_Accounts_Page SHALL redirect the user to the login route, consistent
   with the existing private route guard behavior.
4. THE Settings_Shell_Sidebar SHALL include a navigation link labelled "Child
   Accounts" that routes to `/settings/child-accounts`.
5. WHEN the user is on the `/settings/child-accounts` path, THE
   Settings_Shell_Sidebar SHALL render the "Child Accounts" link in its active
   state.
6. THE Child_Accounts_Page SHALL set a `<title>` meta tag with the value
   `Child Accounts | Settings`.

---

### Requirement 2: Display Student Drafts

**User Story:** As an Adult_User, I want to see all my household students listed
on the Child Accounts page, so that I know which students are active and which
are archived.

#### Acceptance Criteria

1. WHEN the Child_Accounts_Page loads, THE Child_Accounts_Page SHALL fetch the
   authenticated user's profile from the Profile_API and SHALL read the complete
   student draft list from **Household_Student_Drafts_All**
   (`householdStudentDraftsAll`), displaying each Student_Draft as a distinct
   card or row (none omitted; none duplicated across sections).
2. THE Child_Accounts_Page SHALL display Active_Student_Drafts and
   Archived_Student_Drafts in separate, clearly labelled sections.
3. THE Child_Accounts_Page SHALL display the following fields for each
   Student_Draft: `displayName`, `currentGrade` (rendered as a human-readable
   grade label, e.g. "Grade 5" or "Kindergarten"), and `lastPromotionYear`.
4. WHEN the user's `householdStudentDrafts` array contains no
   Active_Student_Drafts, THE Child_Accounts_Page SHALL display an empty-state
   message in the active section indicating that no students have been added
   yet.
5. WHILE the profile data is loading, THE Child_Accounts_Page SHALL display a
   loading indicator in place of the student list.
6. IF the Profile_API returns an error, THEN THE Child_Accounts_Page SHALL
   display an error message and a retry action.
7. WHEN the user's `householdStudentDrafts` array contains no
   Archived_Student_Drafts, THE Child_Accounts_Page SHALL hide the archived
   section entirely.

---

### Requirement 3: Add a New Student Draft

**User Story:** As an Adult_User, I want to add a new child account to my
household, so that I can manage that student's curriculum and compliance from
the sidebar.

#### Acceptance Criteria

1. THE Child_Accounts_Page SHALL provide an "Add Student" control that opens the
   Add_Student_Form.
2. THE Add_Student_Form SHALL require the following fields: `displayName`
   (non-empty string, maximum 100 characters) and `currentGrade` (integer 0–13).
3. WHEN the Adult_User submits the Add_Student_Form, THE Child_Accounts_Page
   SHALL send a `POST /profile/household-students` request to the Profile_API
   with the new student data.
4. THE Profile_API SHALL generate a unique `studentDraftId` (UUID v4) and set
   `lastPromotionYear` to the current calendar year when creating a new
   Student_Draft.
5. IF the Add_Student_Form is submitted with any required field missing or
   invalid, THEN THE Add_Student_Form SHALL display a field-level validation
   error and SHALL NOT submit the request.
6. WHEN the Profile_API returns a success response, THE Child_Accounts_Page
   SHALL update the displayed student list without a full page reload and SHALL
   close the Add_Student_Form.
7. IF the Profile_API returns an error on add, THEN THE Add_Student_Form SHALL
   display an error message and SHALL remain open so the user can retry.
8. WHILE the add-student submission is in progress, THE Add_Student_Form SHALL
   disable the submit button to prevent duplicate submissions.
9. THE new Student_Draft SHALL appear in the active section of the
   Child_Accounts_Page immediately after a successful add.
10. THE new Active_Student_Draft SHALL become available in the Student_Selector
    immediately after the profile query is invalidated following a successful
    add.

---

### Requirement 4: Archive a Student Draft

**User Story:** As an Adult_User, I want to archive a child account I no longer
need active, so that the student is hidden from the sidebar selector while
retaining all their data for future restoration.

#### Acceptance Criteria

1. THE Child_Accounts_Page SHALL display an "Archive" action for each
   Active_Student_Draft.
2. WHEN the Adult_User activates the "Archive" action for an
   Active_Student_Draft, THE Child_Accounts_Page SHALL display a confirmation
   prompt before sending the archive request.
3. WHEN the Adult_User confirms the archive action, THE Child_Accounts_Page
   SHALL send a `PATCH /profile/household-students/:studentDraftId/archive`
   request to the Profile_API.
4. THE Profile_API SHALL set the `archivedAt` field on the matching
   Student_Draft to the current UTC timestamp and SHALL NOT remove the record
   from the array.
5. WHEN the Profile_API returns a success response, THE Child_Accounts_Page
   SHALL move the student from the active section to the archived section
   without a full page reload.
6. IF the Profile_API returns an error on archive, THEN THE Child_Accounts_Page
   SHALL display an error message and SHALL retain the student in the active
   section.
7. WHILE the archive request is in progress, THE Child_Accounts_Page SHALL
   disable the "Archive" action for the student being archived to prevent
   duplicate requests.
8. WHEN a Student_Draft is archived, THE Student_Selector in the sidebar SHALL
   no longer include that student in its list after the profile query is
   invalidated.

---

### Requirement 5: Restore an Archived Student Draft

**User Story:** As an Adult_User, I want to restore an archived child account,
so that the student becomes active again and reappears in the sidebar selector.

#### Acceptance Criteria

1. THE Child_Accounts_Page SHALL display a "Restore" action for each
   Archived_Student_Draft.
2. WHEN the Adult_User activates the "Restore" action for an
   Archived_Student_Draft, THE Child_Accounts_Page SHALL send a
   `PATCH /profile/household-students/:studentDraftId/restore` request to the
   Profile_API without requiring a confirmation prompt.
3. THE Profile_API SHALL clear the `archivedAt` field (set to `null`) on the
   matching Student_Draft.
4. WHEN the Profile_API returns a success response, THE Child_Accounts_Page
   SHALL move the student from the archived section back to the active section
   without a full page reload.
5. IF the Profile_API returns an error on restore, THEN THE Child_Accounts_Page
   SHALL display an error message and SHALL retain the student in the archived
   section.
6. WHILE the restore request is in progress, THE Child_Accounts_Page SHALL
   disable the "Restore" action for the student being restored to prevent
   duplicate requests.
7. WHEN a Student_Draft is restored, THE Student_Selector in the sidebar SHALL
   include that student in its list after the profile query is invalidated.

---

### Requirement 6: Student Selector Filters Archived Students

**User Story:** As an Adult_User, I want the sidebar student selector to only
show active students, so that I am not presented with archived accounts when
switching student views.

#### Acceptance Criteria

1. THE Student_Selector SHALL only display Active_Student_Drafts (those with
   `archivedAt` null or absent) in its list.
2. WHEN all Student_Drafts are archived, THE Student_Selector SHALL display the
   Empty_State (no students available) and SHALL be non-interactive.
3. THE Student_Selector SHALL update its list automatically after a successful
   archive or restore operation invalidates the `['user', 'me']` query.

---

### Requirement 7: Backend — Household Student Mutation Endpoints

**User Story:** As a developer, I want dedicated API endpoints for adding,
archiving, and restoring household student drafts, so that the frontend can
manage them without replacing the entire user document.

#### Acceptance Criteria

1. THE Profile_API SHALL expose a `POST /profile/household-students` endpoint
   that appends a single validated Student_Draft to the authenticated adult
   user's `householdStudentDrafts` array.
2. WHEN the `POST /profile/household-students` request body fails validation
   (missing `displayName`, `displayName` exceeding 100 characters, or
   `currentGrade` outside 0–13), THEN THE Profile_API SHALL return HTTP 400 with
   a descriptive error message.
3. WHEN the authenticated user is not an Adult_User, THEN THE Profile_API SHALL
   return HTTP 403 for `POST /profile/household-students`.
4. THE Profile_API SHALL expose a
   `PATCH /profile/household-students/:studentDraftId/archive` endpoint that
   sets `archivedAt` to the current UTC timestamp on the matching Student_Draft.
5. WHEN the `:studentDraftId` parameter does not match any Student_Draft in the
   user's array, THEN THE Profile_API SHALL return HTTP 404 for the archive
   endpoint.
6. WHEN the authenticated user is not an Adult_User, THEN THE Profile_API SHALL
   return HTTP 403 for the archive endpoint.
7. THE Profile_API SHALL expose a
   `PATCH /profile/household-students/:studentDraftId/restore` endpoint that
   clears `archivedAt` (sets it to `null`) on the matching Student_Draft.
8. WHEN the `:studentDraftId` parameter does not match any Student_Draft in the
   user's array, THEN THE Profile_API SHALL return HTTP 404 for the restore
   endpoint.
9. WHEN the authenticated user is not an Adult_User, THEN THE Profile_API SHALL
   return HTTP 403 for the restore endpoint.
10. THE Profile_API SHALL return HTTP 200 with the updated
    `householdStudentDrafts` array on successful `POST`, archive `PATCH`, and
    restore `PATCH` operations.

---

### Requirement 8: Backend — Schema Extension for Archiving

**User Story:** As a developer, I want the `householdStudentDrafts` schema to
support an `archivedAt` field, so that the soft-delete pattern can be
implemented without data loss.

#### Acceptance Criteria

1. THE User schema SHALL include an `archivedAt` field (type `Date`, nullable,
   default `null`) on each entry in the `householdStudentDrafts` array.
2. WHEN a Student_Draft is created via `POST /profile/household-students`, THE
   Profile_API SHALL set `archivedAt` to `null` on the new record.
3. THE `GET /profile` response for an Adult_User SHALL include a
   `householdStudentDraftsAll` field whose items mirror every stored
   Student_Draft (active and archived), each including `archivedAt` as an ISO
   8601 string when archived or `null` when active—so the Child_Accounts_Page can
   split active vs archived without a second network call.
4. THE `householdStudents` field returned by `GET /profile` SHALL only include
   Student_Drafts where `archivedAt` is `null` or absent, so that the
   Student_Selector continues to show only active students without any frontend
   filtering change to `Student_Selector` code.
5. FOR non-Adult_User profiles, THE Profile_API MAY omit `householdStudentDraftsAll`
   from `GET /profile` because the Child_Accounts_Page is unreachable for those users.

---

### Requirement 9: Grade Display

**User Story:** As an Adult_User, I want student grades displayed as
human-readable labels rather than raw numbers, so that I can quickly understand
each student's level.

#### Acceptance Criteria

1. THE Child_Accounts_Page SHALL render `currentGrade` values using the
   following mapping: 0 → "Kindergarten", 1 → "Grade 1", 2 → "Grade 2", …, 12 →
   "Grade 12", 13 → "Grade 13 / Post-Secondary".
2. THE Add_Student_Form grade selector SHALL present the same human-readable
   labels as selectable options and SHALL map the selected label back to the
   corresponding integer before submission.
3. FOR ALL valid `currentGrade` integers (0–13), the grade display function
   SHALL produce a non-empty string label and the label-to-integer mapping SHALL
   be the inverse of the integer-to-label mapping (round-trip property).
